import { useState, useEffect } from 'react';

const DEFAULT_DEMO_COORDS = {
  lat: 28.6139,
  lng: 77.2090,
  label: 'National Highway 48, KM 42 (Demo)',
  isDemo: true,
};

export function useGeolocation() {
  const [coords, setCoords] = useState(DEFAULT_DEMO_COORDS);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: `GPS Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
          isDemo: false,
        });
        setIsLoading(false);
      },
      (err) => {
        console.warn('Geolocation denied or timed out; using demo location:', err.message);
        setError(err.message);
        setCoords(DEFAULT_DEMO_COORDS);
        setIsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  return { coords, setCoords, error, isLoading };
}
