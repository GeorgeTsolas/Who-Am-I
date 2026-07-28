import { useCallback, useEffect, useRef, useState } from "react";

type PermissionState = "pending" | "granted" | "denied" | "unsupported";

type Options = {
  enabled: boolean;
  onCorrect: () => void;
  onSkip: () => void;
};

/**
 * Detects phone tilt (front/back) to trigger correct/skip.
 * - iOS Safari: requires DeviceOrientationEvent.requestPermission() during a user gesture.
 * - Works in both portrait and landscape by picking the axis with the largest deviation
 *   from the captured baseline, so the user can hold the phone however they want.
 */
export function useTiltControls({ enabled, onCorrect, onSkip }: Options) {
  const [permissionState, setPermissionState] = useState<PermissionState>("pending");

  const stateRef = useRef<"neutral" | "awaiting-reset">("neutral");
  const baselineRef = useRef<{ beta: number; gamma: number } | null>(null);
  const axisRef = useRef<"beta" | "gamma" | null>(null);
  const handlersRef = useRef({ onCorrect, onSkip });
  handlersRef.current = { onCorrect, onSkip };

  const TRIGGER = 45; // degrees from baseline to fire
  const RESET = 20; // must return within this to allow the next fire

  const handler = useCallback((e: DeviceOrientationEvent) => {
    if (e.beta == null || e.gamma == null) return;

    // Capture a baseline on the first reliable sample.
    if (!baselineRef.current) {
      baselineRef.current = { beta: e.beta, gamma: e.gamma };
      return;
    }

    const dBeta = e.beta - baselineRef.current.beta;
    const dGamma = e.gamma - baselineRef.current.gamma;

    // Lock the axis to whichever moved first past a small threshold, so
    // portrait uses beta and landscape uses gamma automatically.
    if (!axisRef.current) {
      if (Math.abs(dBeta) > 12) axisRef.current = "beta";
      else if (Math.abs(dGamma) > 12) axisRef.current = "gamma";
      else return;
    }

    const delta = axisRef.current === "beta" ? dBeta : dGamma;

    if (stateRef.current === "neutral") {
      if (delta > TRIGGER) {
        stateRef.current = "awaiting-reset";
        handlersRef.current.onCorrect();
      } else if (delta < -TRIGGER) {
        stateRef.current = "awaiting-reset";
        handlersRef.current.onSkip();
      }
    } else if (Math.abs(delta) < RESET) {
      stateRef.current = "neutral";
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (typeof window === "undefined") return "unsupported";
    const DOE = (window as unknown as { DeviceOrientationEvent?: unknown })
      .DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<"granted" | "denied">;
        })
      | undefined;
    if (!DOE) {
      setPermissionState("unsupported");
      return "unsupported";
    }
    if (typeof DOE.requestPermission === "function") {
      try {
        const res = await DOE.requestPermission();
        const next: PermissionState = res === "granted" ? "granted" : "denied";
        setPermissionState(next);
        return next;
      } catch {
        setPermissionState("denied");
        return "denied";
      }
    }
    setPermissionState("granted");
    return "granted";
  }, []);

  useEffect(() => {
    if (!enabled || permissionState !== "granted") return;
    // Reset calibration each time the game (re)enables tilt.
    baselineRef.current = null;
    axisRef.current = null;
    stateRef.current = "neutral";
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, [enabled, permissionState, handler]);

  return { permissionState, requestPermission };
}
