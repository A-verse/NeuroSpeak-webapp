import { useState, useEffect, useCallback, useRef } from "react";

export type PermissionState = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export interface GeolocationPosition {
  lat: number;
  lng: number;
  accuracy: number; // meters
}

interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  permissionState: PermissionState;
  isStale: boolean;
  lastUpdated: Date | null;
  requestPermission: () => void;
  error: string | null;
}

const STALE_THRESHOLD_MS = 60_000; // 60 seconds

/**
 * Real browser geolocation hook.
 * Never fabricates coordinates — only uses what the browser provides.
 */
export function useGeolocation(autoRequest = false): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>("idle");
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStaleTimer = () => {
    if (staleTimerRef.current) clearTimeout(staleTimerRef.current);
  };

  const onSuccess = useCallback((pos: globalThis.GeolocationPosition) => {
    setPosition({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
    });
    setPermissionState("granted");
    setIsStale(false);
    setError(null);
    const now = new Date();
    setLastUpdated(now);

    clearStaleTimer();
    staleTimerRef.current = setTimeout(() => setIsStale(true), STALE_THRESHOLD_MS);
  }, []);

  const onError = useCallback((err: GeolocationPositionError) => {
    if (err.code === err.PERMISSION_DENIED) {
      setPermissionState("denied");
      setError("Location access denied. Please enable location permissions in your browser settings.");
    } else if (err.code === err.POSITION_UNAVAILABLE) {
      setPermissionState("unavailable");
      setError("Location is currently unavailable.");
    } else {
      setPermissionState("unavailable");
      setError("Unable to determine location. Please try again.");
    }
  }, []);

  const requestPermission = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setPermissionState("unavailable");
      setError("Geolocation is not supported by your browser.");
      return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setPermissionState("requesting");
    setError(null);

    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    });
  }, [onSuccess, onError]);

  useEffect(() => {
    if (autoRequest) {
      requestPermission();
    }
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      clearStaleTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { position, permissionState, isStale, lastUpdated, requestPermission, error };
}
