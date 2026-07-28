import { useCallback, useEffect, useRef, useState } from "react";

type PermissionState = "pending" | "granted" | "denied" | "unsupported";

type Options = {
  enabled: boolean;
  onCorrect: () => void;
  onSkip: () => void;
};

type Axis = "beta" | "gamma";

type Calibration = {
  beta: number | null;
  gamma: number | null;
  z: number | null;
};

type OrientationSample = { beta: number; gamma: number };

const ORIENTATION_TRIGGER = 60;
const ORIENTATION_RESET = 24;
const MOTION_TRIGGER = 4.8;
const MOTION_RESET = 1.8;
const CALIBRATION_MS = 360;
const MIN_TRIGGER_GAP_MS = 720;

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const getOrientationAngle = () => {
  if (typeof window === "undefined") return 0;
  const angle = window.screen.orientation?.angle;
  if (typeof angle === "number") return angle;
  const legacyOrientation = (window as unknown as { orientation?: number }).orientation;
  return typeof legacyOrientation === "number" ? legacyOrientation : 0;
};

const selectAxis = ({ beta, gamma }: OrientationSample): Axis => {
  const betaRoom = Math.min(180 - beta, beta + 180);
  const gammaRoom = Math.min(90 - gamma, gamma + 90);
  return betaRoom >= gammaRoom ? "beta" : "gamma";
};

const getOrientationDelta = (sample: OrientationSample, baseline: Calibration, axis: Axis) => {
  if (baseline.beta == null || baseline.gamma == null) return 0;
  const raw = axis === "beta" ? sample.beta - baseline.beta : sample.gamma - baseline.gamma;
  const angle = getOrientationAngle();
  const normalized = ((angle % 360) + 360) % 360;
  if (axis === "gamma") return normalized === 90 ? -raw : raw;
  return normalized === 270 ? -raw : raw;
};

/**
 * Detects phone tilt (front/back) to trigger correct/skip.
 * - iOS Safari: requires motion/orientation permission during a user gesture.
 * - Calibrates after the round starts, then requires a deliberate tilt + reset.
 * - Uses gravity (DeviceMotion z-axis) first because landscape orientation can put
 *   DeviceOrientation gamma near its ±90° limit, which makes one direction impossible.
 */
export function useTiltControls({ enabled, onCorrect, onSkip }: Options) {
  const [permissionState, setPermissionState] = useState<PermissionState>("pending");

  const stateRef = useRef<"neutral" | "awaiting-reset">("neutral");
  const baselineRef = useRef<Calibration | null>(null);
  const axisRef = useRef<Axis>("beta");
  const orientationSamplesRef = useRef<OrientationSample[]>([]);
  const motionZSamplesRef = useRef<number[]>([]);
  const calibrationStartedAtRef = useRef(0);
  const smoothedOrientationRef = useRef(0);
  const smoothedMotionRef = useRef(0);
  const lastTriggerAtRef = useRef(0);
  const handlersRef = useRef({ onCorrect, onSkip });
  handlersRef.current = { onCorrect, onSkip };

  const tryFinishCalibration = useCallback(() => {
    if (baselineRef.current) return true;
    const now = performance.now();
    if (now - calibrationStartedAtRef.current < CALIBRATION_MS) return false;

    const orientationSamples = orientationSamplesRef.current;
    const zSamples = motionZSamplesRef.current;
    if (orientationSamples.length === 0 && zSamples.length === 0) return false;

    const beta = orientationSamples.length > 0 ? average(orientationSamples.map((sample) => sample.beta)) : null;
    const gamma = orientationSamples.length > 0 ? average(orientationSamples.map((sample) => sample.gamma)) : null;
    const z = zSamples.length > 0 ? average(zSamples) : null;

    baselineRef.current = { beta, gamma, z };
    if (beta != null && gamma != null) axisRef.current = selectAxis({ beta, gamma });
    smoothedOrientationRef.current = 0;
    smoothedMotionRef.current = 0;
    stateRef.current = "neutral";
    return true;
  }, []);

  const processDelta = useCallback((delta: number, trigger: number, reset: number, source: "motion" | "orientation") => {
    const smoothRef = source === "motion" ? smoothedMotionRef : smoothedOrientationRef;
    const smoothed = smoothRef.current * 0.62 + delta * 0.38;
    smoothRef.current = smoothed;

    if (stateRef.current === "awaiting-reset") {
      if (Math.abs(smoothed) < reset) stateRef.current = "neutral";
      return;
    }

    const now = performance.now();
    if (now - lastTriggerAtRef.current < MIN_TRIGGER_GAP_MS) return;

    if (smoothed > trigger) {
      lastTriggerAtRef.current = now;
      stateRef.current = "awaiting-reset";
      handlersRef.current.onSkip();
    } else if (smoothed < -trigger) {
      lastTriggerAtRef.current = now;
      stateRef.current = "awaiting-reset";
      handlersRef.current.onCorrect();
    }
  }, []);

  const orientationHandler = useCallback((e: DeviceOrientationEvent) => {
    if (e.beta == null || e.gamma == null) return;

    const sample = { beta: e.beta, gamma: e.gamma };
    if (!baselineRef.current) {
      orientationSamplesRef.current.push(sample);
      tryFinishCalibration();
      return;
    }

    const delta = getOrientationDelta(sample, baselineRef.current, axisRef.current);
    // Prefer DeviceMotion when available. It avoids DeviceOrientation getting stuck near
    // gamma ±90° in landscape, where only one tilt direction can be detected reliably.
    if (baselineRef.current.z != null) return;
    processDelta(delta, ORIENTATION_TRIGGER, ORIENTATION_RESET, "orientation");
  }, [processDelta, tryFinishCalibration]);

  const motionHandler = useCallback((e: DeviceMotionEvent) => {
    const z = e.accelerationIncludingGravity?.z;
    if (typeof z !== "number") return;

    if (!baselineRef.current) {
      motionZSamplesRef.current.push(z);
      tryFinishCalibration();
      return;
    }
    if (baselineRef.current.z == null) return;

    processDelta(z - baselineRef.current.z, MOTION_TRIGGER, MOTION_RESET, "motion");
  }, [processDelta, tryFinishCalibration]);

  const requestPermission = useCallback(async (): Promise<PermissionState> => {
    if (typeof window === "undefined") return "unsupported";
    const DOE = (window as unknown as { DeviceOrientationEvent?: unknown })
      .DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<"granted" | "denied">;
        })
      | undefined;
    const DME = (window as unknown as { DeviceMotionEvent?: unknown })
      .DeviceMotionEvent as
      | (typeof DeviceMotionEvent & {
          requestPermission?: () => Promise<"granted" | "denied">;
        })
      | undefined;

    if (!DOE && !DME) {
      setPermissionState("unsupported");
      return "unsupported";
    }

    const requests: Array<Promise<"granted" | "denied">> = [];
    if (typeof DOE?.requestPermission === "function") requests.push(DOE.requestPermission());
    if (typeof DME?.requestPermission === "function") requests.push(DME.requestPermission());

    if (requests.length > 0) {
      try {
        const results = await Promise.all(requests);
        const next: PermissionState = results.some((result) => result === "granted") ? "granted" : "denied";
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
    axisRef.current = "beta";
    orientationSamplesRef.current = [];
    motionZSamplesRef.current = [];
    calibrationStartedAtRef.current = performance.now();
    smoothedOrientationRef.current = 0;
    smoothedMotionRef.current = 0;
    lastTriggerAtRef.current = 0;
    stateRef.current = "neutral";
    window.addEventListener("deviceorientation", orientationHandler);
    window.addEventListener("devicemotion", motionHandler);
    return () => {
      window.removeEventListener("deviceorientation", orientationHandler);
      window.removeEventListener("devicemotion", motionHandler);
    };
  }, [enabled, permissionState, orientationHandler, motionHandler]);

  return { permissionState, requestPermission };
}
