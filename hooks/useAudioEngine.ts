"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  getAudioContext,
  playDetentClick as synthDetentClick,
  playLockChime as synthLockChime,
  playAlarmRing as synthAlarmRing,
} from "@/lib/audio";

export interface AudioEngineReturn {
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  toggleSound: () => void;
  playDetentClick: (velocityRatio?: number) => void;
  playLockChime: () => void;
  playAlarmRing: () => void;
  initAudio: () => Promise<void>;
}

export function useAudioEngine(initialSoundEnabled = true): AudioEngineReturn {
  const [soundEnabled, setSoundEnabledState] = useState(initialSoundEnabled);
  const soundEnabledRef = useRef(initialSoundEnabled);

  // Sync state when initialSoundEnabled changes (e.g. from localStorage hydration)
  useEffect(() => {
    setSoundEnabledState(initialSoundEnabled);
    soundEnabledRef.current = initialSoundEnabled;
  }, [initialSoundEnabled]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundEnabledRef.current = enabled;
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabledState((prev) => {
      const next = !prev;
      soundEnabledRef.current = next;
      return next;
    });
  }, []);

  const initAudio = useCallback(async () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        // Ignore if blocked by browser autoplay policy
      }
    }
  }, []);

  const playDetentClick = useCallback((velocityRatio = 0.5) => {
    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    synthDetentClick(ctx, velocityRatio);
  }, []);

  const playLockChime = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    synthLockChime(ctx);
  }, []);

  const playAlarmRing = useCallback(() => {
    if (!soundEnabledRef.current) return;
    const ctx = getAudioContext();
    synthAlarmRing(ctx);
  }, []);

  return {
    soundEnabled,
    setSoundEnabled,
    toggleSound,
    playDetentClick,
    playLockChime,
    playAlarmRing,
    initAudio,
  };
}
