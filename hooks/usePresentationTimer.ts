"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { StageMode, TimerState, StageSignal } from "@/lib/types";
import { DEFAULT_TARGET_SEC, CURVEBALL_PROMPTS } from "@/lib/constants";

export interface PresentationTimerReturn {
  timerState: TimerState;
  timerRunning: boolean;
  stageMode: StageMode;
  setStageMode: (mode: StageMode) => void;
  elapsedSec: number;
  setElapsedSec: React.Dispatch<React.SetStateAction<number>>;
  targetSec: number;
  setTargetSec: (sec: number) => void;
  remainingSec: number;
  isOvertime: boolean;
  stageSignal: StageSignal;
  customMinutes: string;
  setCustomMinutes: (val: string) => void;
  applyCustomMinutes: () => boolean;
  curveballEnabled: boolean;
  setCurveballEnabled: (enabled: boolean) => void;
  toggleCurveball: () => void;
  activeCurveball: string;
  dismissCurveball: () => void;
  start: () => void;
  pause: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  setDuration: (seconds: number) => void;
}

export function usePresentationTimer(
  initialTargetSec = DEFAULT_TARGET_SEC,
  onTimeUp?: () => void
): PresentationTimerReturn {
  const [stageMode, setStageMode] = useState<StageMode>("SPIN");
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [targetSec, setTargetSecState] = useState(initialTargetSec);
  const [customMinutes, setCustomMinutes] = useState("");
  const [curveballEnabled, setCurveballEnabled] = useState(false);
  const [activeCurveball, setActiveCurveball] = useState("");

  const elapsedRef = useRef(0);
  const timeUpFiredRef = useRef(false);
  const curveballFiredRef = useRef(false);
  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const remainingSec = Math.max(0, targetSec - elapsedSec);
  const isOvertime = false;

  const timerState: TimerState = useMemo(() => {
    if (timerRunning) return "RUNNING";
    if (elapsedSec === 0) return "IDLE";
    if (remainingSec <= 0) return "COMPLETED";
    return "PAUSED";
  }, [timerRunning, elapsedSec, remainingSec]);

  useEffect(() => {
    elapsedRef.current = elapsedSec;
    if (elapsedSec < targetSec) {
      timeUpFiredRef.current = false;
    }
    if (elapsedSec === 0) {
      curveballFiredRef.current = false;
    }
  }, [elapsedSec, targetSec]);

  // 1000ms countdown interval that fires onTimeUp once outside state updaters
  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      const next = Math.min(targetSec, elapsedRef.current + 1);
      elapsedRef.current = next;
      setElapsedSec(next);

      const currentRemaining = targetSec - next;

      if (curveballEnabled && currentRemaining === 45 && !curveballFiredRef.current) {
        curveballFiredRef.current = true;
        const pick = CURVEBALL_PROMPTS[Math.floor(Math.random() * CURVEBALL_PROMPTS.length)];
        setActiveCurveball(pick);
      }

      if (targetSec > 0 && currentRemaining <= 0) {
        setTimerRunning(false);
        if (!timeUpFiredRef.current) {
          timeUpFiredRef.current = true;
          setTimeout(() => onTimeUpRef.current?.(), 0);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, targetSec, curveballEnabled]);

  // Dynamic Stage Signals (Strictly Hitam, Putih, & Kuning Stabilo)
  const stageSignal = useMemo<StageSignal>(() => {
    if (elapsedSec === 0 && !timerRunning) {
      return {
        label: "Siap Mulai",
        color: "text-[#0D1117]",
        badgeBg: "bg-[#F4F5F7] text-[#0D1117] border border-black/10",
        dotColor: "bg-[#0D1117]/40",
        pillClass: "bg-[#F4F5F7] text-[#0D1117]",
        digitColor: "text-[#0D1117]",
      };
    }
    if (remainingSec <= 0 && elapsedSec >= targetSec) {
      return {
        label: "Waktu Habis!",
        color: "text-[#0D1117]",
        badgeBg: "bg-[#0D1117] text-[#C6FF33] font-semibold",
        dotColor: "bg-[#C6FF33]",
        pillClass: "bg-[#0D1117] text-[#C6FF33] font-semibold",
        digitColor: "text-[#0D1117]",
      };
    }
    if (remainingSec <= 10) {
      return {
        label: "Sisa 10 Detik",
        color: "text-[#0D1117]",
        badgeBg: "bg-[#0D1117] text-[#C6FF33] font-semibold",
        dotColor: "bg-[#C6FF33]",
        pillClass: "bg-[#0D1117] text-[#C6FF33] font-semibold",
        digitColor: "text-[#0D1117]",
      };
    }
    if (remainingSec <= 30) {
      return {
        label: "Sisa 30 Detik",
        color: "text-[#0D1117]",
        badgeBg: "bg-[#C6FF33] text-[#0D1117] font-semibold border border-[#0D1117]/20",
        dotColor: "bg-[#0D1117]",
        pillClass: "bg-[#C6FF33] text-[#0D1117] font-semibold",
        digitColor: "text-[#0D1117]",
      };
    }
    if (elapsedSec >= Math.floor(targetSec / 2)) {
      return {
        label: "50% Durasi Tercapai",
        color: "text-[#0D1117]",
        badgeBg: "bg-[#C6FF33] text-[#0D1117] font-semibold",
        dotColor: "bg-[#0D1117]",
        pillClass: "bg-[#C6FF33] text-[#0D1117] font-semibold",
        digitColor: "text-[#0D1117]",
      };
    }
    return {
      label: "Fase Awal",
      color: "text-[#0D1117]",
      badgeBg: "bg-[#0D1117] text-white font-semibold",
      dotColor: "bg-[#C6FF33]",
      pillClass: "bg-[#0D1117] text-white font-semibold",
      digitColor: "text-[#0D1117]",
    };
  }, [elapsedSec, remainingSec, targetSec, timerRunning]);

  const start = useCallback(() => {
    if (elapsedRef.current >= targetSec) {
      elapsedRef.current = 0;
      timeUpFiredRef.current = false;
      curveballFiredRef.current = false;
      setElapsedSec(0);
    }
    setTimerRunning(true);
  }, [targetSec]);

  const pause = useCallback(() => {
    setTimerRunning(false);
  }, []);

  const toggleTimer = useCallback(() => {
    if (timerRunning) {
      pause();
    } else {
      start();
    }
  }, [timerRunning, pause, start]);

  const resetTimer = useCallback(() => {
    elapsedRef.current = 0;
    timeUpFiredRef.current = false;
    curveballFiredRef.current = false;
    setTimerRunning(false);
    setElapsedSec(0);
    setActiveCurveball("");
  }, []);

  const setDuration = useCallback((seconds: number) => {
    elapsedRef.current = 0;
    timeUpFiredRef.current = false;
    curveballFiredRef.current = false;
    setTargetSecState(seconds);
    setElapsedSec(0);
    setCustomMinutes("");
  }, []);

  const setTargetSec = useCallback((sec: number) => {
    setTargetSecState(sec);
  }, []);

  const applyCustomMinutes = useCallback((): boolean => {
    const num = parseFloat(customMinutes);
    if (!isNaN(num) && num > 0 && num <= 120) {
      elapsedRef.current = 0;
      timeUpFiredRef.current = false;
      curveballFiredRef.current = false;
      setTargetSecState(Math.round(num * 60));
      setElapsedSec(0);
      return true;
    }
    return false;
  }, [customMinutes]);

  const toggleCurveball = useCallback(() => {
    setCurveballEnabled((prev) => !prev);
  }, []);

  const dismissCurveball = useCallback(() => {
    setActiveCurveball("");
  }, []);

  return {
    timerState,
    timerRunning,
    stageMode,
    setStageMode,
    elapsedSec,
    setElapsedSec,
    targetSec,
    setTargetSec,
    remainingSec,
    isOvertime,
    stageSignal,
    customMinutes,
    setCustomMinutes,
    applyCustomMinutes,
    curveballEnabled,
    setCurveballEnabled,
    toggleCurveball,
    activeCurveball,
    dismissCurveball,
    start,
    pause,
    toggleTimer,
    resetTimer,
    setDuration,
  };
}
