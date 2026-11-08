"use client";

import React, { useState, useEffect } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { StageMode, StageSignal, CueNotes } from "@/lib/types";
import { SlotReel } from "./SlotReel";
import { TimerClock } from "./TimerClock";
import { StageActionButtons, TimerDurationSelector } from "./StageControls";
import { CueNotesBar } from "./CueNotesBar";

export interface StageContainerProps {
  stageMode: StageMode;
  onSetStageMode: (mode: StageMode) => void;
  // Reel props
  isSpinning: boolean;
  reelSequence: string[];
  reelOffset: number;
  activeSlotIndex: number;
  activeTitles: string[];
  isLocked: boolean;
  onToggleLock: () => void;
  selectedTitle: string | null;
  selectedConstraint: string | null;
  onSpin: () => void;
  // Timer props
  elapsedSec: number;
  remainingSec: number;
  stageSignal: StageSignal;
  timerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onCompleteAndArchive: () => void;
  targetSec: number;
  onSelectDurationPreset: (sec: number) => void;
  customMinutes: string;
  onCustomMinutesChange: (val: string) => void;
  onApplyCustomMinutes: () => void;
  // Cues & Curveball props
  notes: CueNotes;
  onNoteChange: (index: number, text: string) => void;
  getWordCount: (index: number) => number;
  curveballEnabled: boolean;
  onToggleCurveball: () => void;
  activeCurveball: string;
  onDismissCurveball: () => void;
}

export function StageContainer({
  stageMode,
  onSetStageMode,
  isSpinning,
  reelSequence,
  reelOffset,
  activeSlotIndex,
  activeTitles,
  selectedTitle,
  selectedConstraint,
  onSpin,
  elapsedSec,
  remainingSec,
  stageSignal,
  timerRunning,
  onToggleTimer,
  onResetTimer,
  onCompleteAndArchive,
  targetSec,
  onSelectDurationPreset,
  customMinutes,
  onCustomMinutesChange,
  onApplyCustomMinutes,
  notes,
  onNoteChange,
  getWordCount,
  curveballEnabled,
  onToggleCurveball,
  activeCurveball,
  onDismissCurveball,
}: StageContainerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  return (
    <section
      id="panggung-utama"
      className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-6"
    >
      <div className="relative rounded-2xl bg-canvas border border-hairline p-6 sm:p-10 shadow-xs flex flex-col justify-center min-h-[calc(100vh-84px)]">
        <button
          type="button"
          data-testid="fullscreen-btn"
          aria-label={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
          onClick={toggleFullscreen}
          className="absolute top-3 right-3 z-30 w-11 h-11 min-w-[44px] min-h-[44px] text-ink hover:text-ink-slate flex items-center justify-center transition-colors cursor-pointer"
          title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Maximize2 className="w-4 h-4" aria-hidden="true" />
          )}
        </button>

        {stageMode === "SPIN" ? (
          <SlotReel
            isSpinning={isSpinning}
            reelSequence={reelSequence}
            reelOffset={reelOffset}
            activeSlotIndex={activeSlotIndex}
            activeTitles={activeTitles}
            selectedConstraint={selectedConstraint}
          />
        ) : (
          <TimerClock
            remainingSec={remainingSec}
            stageSignal={stageSignal}
            activeTopic={selectedTitle || (activeTitles.length > 0 ? activeTitles[0] : null)}
            activeConstraint={selectedConstraint}
          />
        )}

        <StageActionButtons
          stageMode={stageMode}
          onSetStageMode={onSetStageMode}
          isSpinning={isSpinning}
          onSpin={onSpin}
          timerRunning={timerRunning}
          elapsedSec={elapsedSec}
          targetSec={targetSec}
          onToggleTimer={onToggleTimer}
          onResetTimer={onResetTimer}
          onCompleteAndArchive={onCompleteAndArchive}
        />
      </div>

      <TimerDurationSelector
        timerRunning={timerRunning}
        targetSec={targetSec}
        onSelectDurationPreset={onSelectDurationPreset}
        customMinutes={customMinutes}
        onCustomMinutesChange={onCustomMinutesChange}
        onApplyCustomMinutes={onApplyCustomMinutes}
      />

      <div className="mt-6 rounded-2xl bg-canvas border border-hairline p-4 sm:p-5 shadow-2xs">
        <CueNotesBar
          notes={notes}
          onNoteChange={onNoteChange}
          getWordCount={getWordCount}
          curveballEnabled={curveballEnabled}
          onToggleCurveball={onToggleCurveball}
          activeCurveball={activeCurveball}
          onDismissCurveball={onDismissCurveball}
        />
      </div>
    </section>
  );
}
