"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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

  const remainingSec = Math.max(0, targetSec - elapsedSec);
  const isOvertime = false;

  const timerState: TimerState = useMemo(() => {
    if (timerRunning) return "RUNNING";
    if (elapsedSec === 0) return "IDLE";
    if (remainingSec <= 0) return "COMPLETED";
    return "PAUSED";
  }, [timerRunning, elapsedSec, remainingSec]);

  // 1000ms countdown interval that automatically stops and rings alarm at 00:00:00
  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setElapsedSec((prev) => {
        const next = prev + 1;
        const currentRemaining = targetSec - next;

        if (curveballEnabled && currentRemaining === 45) {
          const pick = CURVEBALL_PROMPTS[Math.floor(Math.random() * CURVEBALL_PROMPTS.length)];
          setActiveCurveball(pick);
        }

        if (currentRemaining <= 0) {
          setTimerRunning(false);
          if (onTimeUp) {
            setTimeout(() => onTimeUp(), 0);
          }
          return targetSec;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, targetSec, curveballEnabled, onTimeUp]);

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
    setElapsedSec((prev) => (prev >= targetSec ? 0 : prev));
    setTimerRunning(true);
  }, [targetSec]);

  const pause = useCallback(() => {
    setTimerRunning(false);
  }, []);

  const toggleTimer = useCallback(() => {
    setTimerRunning((prev) => {
      if (!prev) {
        setElapsedSec((elapsed) => (elapsed >= targetSec ? 0 : elapsed));
      }
      return !prev;
    });
  }, [targetSec]);

  const resetTimer = useCallback(() => {
    setTimerRunning(false);
    setElapsedSec(0);
    setActiveCurveball("");
  }, []);

  const setDuration = useCallback((seconds: number) => {
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
