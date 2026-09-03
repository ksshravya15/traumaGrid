import cv2
import numpy as np
import base64
import io
from typing import List, Optional
from PIL import Image
from scipy.signal import butter, filtfilt

from backend.app.schemas.schemas import RppgInput, RppgResult


def butter_bandpass(lowcut: float, highcut: float, fs: float, order: int = 2):
    nyq = 0.5 * fs
    low = lowcut / nyq
    high = highcut / nyq
    b, a = butter(order, [low, high], btype='band')
    return b, a


def bandpass_filter(data: np.ndarray, lowcut: float = 0.75, highcut: float = 3.0, fs: float = 30.0) -> np.ndarray:
    """Bandpass filter for 45 BPM (0.75 Hz) to 180 BPM (3.0 Hz)"""
    b, a = butter_bandpass(lowcut, highcut, fs, order=2)
    return filtfilt(b, a, data)


class RppgEstimator:
    """
    Experimental Remote Photoplethysmography (rPPG) Pulse Estimator.
    Analyzes micro-fluctuations in facial skin reflection (predominantly the Green channel)
    caused by cardiovascular blood volume pulses.
    
    DISCLAIMER:
    This is an experimental optical prototype and is NOT clinically validated.
    """

    def __init__(self):
        self.face_cascade = None
        if hasattr(cv2, "CascadeClassifier") and hasattr(cv2, "data") and hasattr(cv2.data, "haarcascades"):
            try:
                cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                self.face_cascade = cv2.CascadeClassifier(cascade_path)
            except Exception as e:
                print(f"[rPPG] Could not initialize CascadeClassifier: {e}")

    def decode_frame(self, b64_str: str) -> Optional[np.ndarray]:
        try:
            if "," in b64_str:
                b64_str = b64_str.split(",")[1]
            data = base64.b64decode(b64_str)
            image = Image.open(io.BytesIO(data)).convert("RGB")
            return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        except Exception as e:
            print(f"[rPPG] Error decoding frame: {e}")
            return None

    def extract_face_roi(self, frame: np.ndarray) -> Optional[np.ndarray]:
        """Detect face/skin ROI using CascadeClassifier or YCrCb skin segmentation."""
        if self.face_cascade is not None:
            try:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(60, 60))
                if len(faces) > 0:
                    x, y, w, h = max(faces, key=lambda b: b[2] * b[3])
                    roi_y = int(y + 0.15 * h)
                    roi_h = int(0.35 * h)
                    roi_x = int(x + 0.20 * w)
                    roi_w = int(0.60 * w)
                    return frame[roi_y:roi_y + roi_h, roi_x:roi_x + roi_w]
            except Exception:
                pass

        # Skin tone segmentation in YCrCb space (standard in physiological optical imaging)
        try:
            ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
            # Standard skin chrominance bounds
            cr = ycrcb[:, :, 1]
            cb = ycrcb[:, :, 2]
            skin_mask = (cr >= 133) & (cr <= 173) & (cb >= 77) & (cb <= 127)
            if np.sum(skin_mask) > 500:
                # Return masked skin pixels
                return frame[skin_mask]
        except Exception:
            pass

        # Fallback to center 40% region
        h, w, _ = frame.shape
        return frame[int(h * 0.25):int(h * 0.65), int(w * 0.3):int(w * 0.7)]

    def estimate(self, input_data: RppgInput) -> RppgResult:
        # Check for explicit demo mode / simulated BPM
        if input_data.simulated_bpm is not None:
            bpm = float(input_data.simulated_bpm)
            # Synthesize realistic photoplethysmogram waveform (60 points)
            t = np.linspace(0, 2 * np.pi * (bpm / 60.0) * 2, 60)
            waveform = (np.sin(t) + 0.3 * np.sin(2 * t) + np.random.normal(0, 0.05, 60)).tolist()
            return RppgResult(
                heart_rate=round(bpm, 1),
                confidence=0.88,
                status="estimated",
                waveform=waveform,
                disclaimer="Estimated pulse — Experimental optical measurement — verify clinically.",
            )

        # Multi-frame video buffer processing
        if input_data.frames_base64 and len(input_data.frames_base64) >= 30:
            green_signals = []
            for b64 in input_data.frames_base64:
                frame = self.decode_frame(b64)
                if frame is None:
                    continue
                roi = self.extract_face_roi(frame)
                if roi is not None and roi.size > 0:
                    # Mean green channel value in ROI
                    green_signals.append(np.mean(roi[:, :, 1]))
                else:
                    # Fallback to center crop
                    h, w, _ = frame.shape
                    center_roi = frame[int(h * 0.2):int(h * 0.5), int(w * 0.3):int(w * 0.7), 1]
                    green_signals.append(np.mean(center_roi))

            if len(green_signals) >= 30:
                raw_sig = np.array(green_signals)
                # Detrend
                sig = raw_sig - np.mean(raw_sig)
                try:
                    # Bandpass filter
                    fs = input_data.fps if input_data.fps > 0 else 30.0
                    filtered = bandpass_filter(sig, lowcut=0.75, highcut=3.0, fs=fs)
                    
                    # FFT power spectral density
                    fft_vals = np.abs(np.fft.rfft(filtered))
                    freqs = np.fft.rfftfreq(len(filtered), d=1.0 / fs)
                    
                    # Valid human heart rate frequency bounds (0.75 Hz to 3.0 Hz -> 45 to 180 BPM)
                    valid_idx = np.where((freqs >= 0.75) & (freqs <= 3.0))[0]
                    if len(valid_idx) > 0:
                        peak_idx = valid_idx[np.argmax(fft_vals[valid_idx])]
                        peak_freq = freqs[peak_idx]
                        est_hr = peak_freq * 60.0
                        confidence = float(np.max(fft_vals[valid_idx]) / (np.sum(fft_vals[valid_idx]) + 1e-6))
                        confidence = min(max(confidence * 2.0, 0.45), 0.92)

                        return RppgResult(
                            heart_rate=round(est_hr, 1),
                            confidence=round(confidence, 2),
                            status="estimated",
                            waveform=filtered[-60:].tolist() if len(filtered) >= 60 else filtered.tolist(),
                            disclaimer="Estimated pulse — Experimental optical measurement — verify clinically.",
                        )
                except Exception as e:
                    print(f"[rPPG] Signal processing error: {e}")

        # Single frame or insufficient frames
        if input_data.image_base64:
            frame = self.decode_frame(input_data.image_base64)
            if frame is not None:
                roi = self.extract_face_roi(frame)
                if roi is not None:
                    # Face detected, but single frame cannot compute temporal frequency
                    # Provide realistic estimation indicator with status
                    return RppgResult(
                        heart_rate=None,
                        confidence=None,
                        status="Pulse estimation unavailable — Multi-frame optical temporal tracking required",
                        waveform=None,
                        disclaimer="Estimated pulse — Experimental optical measurement — verify clinically.",
                    )

        # Failure to extract
        return RppgResult(
            heart_rate=None,
            confidence=None,
            status="Pulse estimation unavailable",
            waveform=None,
            disclaimer="Estimated pulse — Experimental optical measurement — verify clinically.",
        )


rppg_estimator = RppgEstimator()
