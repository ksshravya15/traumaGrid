import React, { useState, useRef } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';

export function CameraAssessment({ onImageCaptured, isAnalyzing, capturedImage, setCapturedImage }) {
  const { videoRef, isActive, error, startCamera, stopCamera, captureFrame } = useCamera();
  const fileInputRef = useRef(null);

  const handleCapture = () => {
    const dataUrl = captureFrame();
    if (dataUrl) {
      onImageCaptured(dataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setCapturedImage(dataUrl);
      onImageCaptured(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Preset sample generator for desktop or camera-restricted environments
  const handlePresetScenario = (scenario) => {
    // Generate a simple colored canvas frame representation
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Subject placeholder
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(320, 200, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(240, 270, 160, 160);

    if (scenario === 'highway_accident') {
      // Add red hemorrhage area
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(350, 360, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#991b1b';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('SCENARIO: HIGHWAY ACCIDENT (HEMORRHAGE)', 40, 60);
    } else if (scenario === 'fracture') {
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(280, 370, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c2410c';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('SCENARIO: SUSPECTED LIMB FRACTURE', 60, 60);
    } else {
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('SCENARIO: STABLE PATIENT (NO EXTERNAL BLEEDING)', 40, 60);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    onImageCaptured(dataUrl, scenario);
  };

  return (
    <div className="bg-trauma-panel border border-trauma-border rounded-2xl p-4 sm:p-5 shadow-2xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-red-400" />
          <h3 className="font-extrabold text-base sm:text-lg text-white">Visual Trauma Assessment</h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">Step 2 • Computer Vision</span>
      </div>

      <p className="text-xs text-slate-300 mb-3">
        Align the victim's visible injuries in the frame. AI will inspect for massive external hemorrhage, limb deformities, or open trauma.
      </p>

      {/* Viewfinder Container */}
      <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border-2 border-slate-700 shadow-inner flex items-center justify-center">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured frame" className="w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover ${isActive ? 'block' : 'hidden'}`}
            />
            {!isActive && (
              <div className="text-center p-4">
                <Camera className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-3">Camera is idle or permissions pending</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shadow-md transition-colors inline-flex items-center space-x-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>ENABLE CAMERA</span>
                </button>
              </div>
            )}
          </>
        )}

        {/* HUD Target Overlays */}
        {isActive && !capturedImage && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner Reticles */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-red-400"></div>
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-red-400"></div>
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-red-400"></div>
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-red-400"></div>
            
            {/* Center target */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 border border-dashed border-red-400/50 rounded-lg flex items-center justify-center">
                <span className="text-[10px] text-red-400/80 font-mono tracking-wider">TARGET ZONE</span>
              </div>
            </div>
          </div>
        )}

        {/* Analyzing Overlay & Scanline */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-20">
            <div className="w-full h-1 bg-red-500 absolute top-0 animate-scanline shadow-[0_0_12px_#ef4444]"></div>
            <RefreshCw className="w-8 h-8 text-red-400 animate-spin mb-2" />
            <span className="text-sm font-bold text-white tracking-wide">Analyzing scene locally...</span>
            <span className="text-[11px] text-slate-400 font-mono mt-1">Edge inference active</span>
          </div>
        )}
      </div>

      {/* Camera Action Buttons */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {capturedImage ? (
            <button
              type="button"
              onClick={handleRetake}
              disabled={isAnalyzing}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCapture}
              disabled={!isActive || isAnalyzing}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center space-x-1.5"
            >
              <Camera className="w-4 h-4" />
              <span>CAPTURE FRAME</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Quick Demo Presets */}
        <div className="flex items-center space-x-1">
          <span className="text-[11px] text-slate-500 hidden sm:inline">Presets:</span>
          <button
            type="button"
            onClick={() => handlePresetScenario('highway_accident')}
            className="px-2 py-1 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/40 rounded text-[11px] font-mono"
            title="Load demo accident with severe hemorrhage"
          >
            🔴 Bleeding
          </button>
          <button
            type="button"
            onClick={() => handlePresetScenario('fracture')}
            className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 rounded text-[11px] font-mono"
            title="Load demo accident with fracture"
          >
            🦴 Fracture
          </button>
          <button
            type="button"
            onClick={() => handlePresetScenario('stable')}
            className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/40 rounded text-[11px] font-mono"
            title="Load demo stable patient"
          >
            🟢 Stable
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="mt-3 p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>
          <strong>Notice:</strong> AI-assisted assessment — not a medical diagnosis. Edge computer vision runs locally where supported.
        </span>
      </div>
    </div>
  );
}
