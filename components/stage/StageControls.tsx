"use client";

import React from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Archive,
  Shuffle,
  Timer,
  Check,
} from "lucide-react";
import { StageMode } from "@/lib/types";
import { DURATION_CARDS } from "@/lib/constants";

export interface StageControlsProps {
  stageMode: StageMode;
  onSetStageMode: (mode: StageMode) => void;
  isSpinning: boolean;
  isLocked: boolean;
  onToggleLock: () => void;
  selectedTitle: string | null;
  selectedConstraint: string | null;
  onSpin: () => void;
  timerRunning: boolean;
  elapsedSec?: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onCompleteAndArchive: () => void;
  targetSec: number;
  onSelectDurationPreset: (sec: number) => void;
  customMinutes: string;
  onCustomMinutesChange: (val: string) => void;
  onApplyCustomMinutes: () => void;
}

export interface StageActionButtonsProps {
  stageMode: StageMode;
  onSetStageMode: (mode: StageMode) => void;
  isSpinning: boolean;
  onSpin: () => void;
  timerRunning: boolean;
  elapsedSec?: number;
  targetSec?: number;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onCompleteAndArchive: () => void;
}

export function StageActionButtons({
  stageMode,
  onSetStageMode,
  isSpinning,
  onSpin,
  timerRunning,
  elapsedSec = 0,
  targetSec = 120,
  onToggleTimer,
  onResetTimer,
  onCompleteAndArchive,
}: StageActionButtonsProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      {stageMode === "SPIN" ? (
        <>
          <button
            type="button"
            data-testid="spin-btn"
            id="spin-action-btn"
            aria-label="Putar Ide Topik"
            disabled={isSpinning}
            onClick={onSpin}
            className="min-h-[46px] inline-flex items-center gap-2 px-7 py-2.5 rounded-lg bg-accent-lime hover:bg-accent-lime-hover text-ink font-semibold text-sm border border-ink/15 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-4 h-4" aria-hidden="true" />
            <span>{isSpinning ? "Menggulir..." : "Putar Ide"}</span>
          </button>

          <button
            type="button"
            data-testid="open-timer-btn"
            aria-label="Buka Timer Panggung"
            onClick={() => onSetStageMode("TIMER")}
            className="min-h-[46px] inline-flex items-center gap-2 px-7 py-2.5 rounded-lg bg-ink hover:bg-ink-deep text-white font-medium text-sm transition-colors cursor-pointer"
          >
            <Timer className="w-4 h-4 text-accent-lime" aria-hidden="true" />
            <span>Buka Timer</span>
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            data-testid={timerRunning ? "pause-timer-btn" : "start-timer-btn"}
            id="timer-toggle-btn"
            aria-label={timerRunning ? "Jeda Timer" : "Mulai Timer"}
            onClick={onToggleTimer}
            className="min-h-[46px] inline-flex items-center gap-2 px-7 py-2.5 rounded-lg bg-accent-lime hover:bg-accent-lime-hover text-ink font-semibold text-sm border border-ink/15 transition-colors cursor-pointer"
          >
            {timerRunning ? (
              <>
                <Pause className="w-4 h-4" aria-hidden="true" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>{elapsedSec > 0 && elapsedSec < targetSec ? "Lanjut" : "Mulai Timer"}</span>
              </>
            )}
          </button>

          <button
            type="button"
            data-testid="reset-timer-btn"
            id="timer-reset-btn"
            aria-label="Reset Timer"
            onClick={onResetTimer}
            className="min-h-[46px] px-5 py-2.5 rounded-lg bg-surface hover:bg-surface-hover text-ink border border-hairline font-medium text-sm inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            data-testid="complete-archive-btn"
            aria-label="Selesaikan Sesi dan Arsipkan Topik"
            onClick={onCompleteAndArchive}
            className="min-h-[46px] inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-ink hover:bg-ink-deep text-white font-medium text-sm transition-colors cursor-pointer"
          >
            <Archive className="w-4 h-4 text-accent-lime" aria-hidden="true" />
            <span>Selesai &amp; Arsipkan</span>
          </button>
        </>
      )}
    </div>
  );
}

export interface TimerDurationSelectorProps {
  timerRunning: boolean;
  targetSec: number;
  onSelectDurationPreset: (sec: number) => void;
  customMinutes: string;
  onCustomMinutesChange: (val: string) => void;
  onApplyCustomMinutes: () => void;
}

export function TimerDurationSelector({
  timerRunning,
  targetSec,
  onSelectDurationPreset,
  customMinutes,
  onCustomMinutesChange,
  onApplyCustomMinutes,
}: TimerDurationSelectorProps) {
  const parsedCustom = Number(customMinutes);
  const isCustomValid =
    customMinutes.trim() !== "" &&
    !Number.isNaN(parsedCustom) &&
    parsedCustom >= 1 &&
    parsedCustom <= 120 &&
    !timerRunning;
  const isCustomCardActive =
    targetSec !== 60 && targetSec !== 120 && targetSec !== 180;

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DURATION_CARDS.map((card) => {
          const isSelected = targetSec === card.sec && !customMinutes;
          return (
            <button
              key={card.id}
              type="button"
              data-testid={`preset-${card.id}`}
              id={`duration-card-${card.id}`}
              aria-label={`Pilih Durasi ${card.label} ${card.display}`}
              disabled={timerRunning}
              onClick={() => onSelectDurationPreset(card.sec)}
              className={`min-h-[64px] text-left rounded-2xl px-4 py-2.5 transition-colors border flex items-center justify-between gap-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isSelected
                  ? "bg-ink text-white border-ink"
                  : "bg-canvas hover:bg-surface text-ink border-hairline shadow-2xs"
              }`}
            >
              <div>
                <div className="text-xs sm:text-sm font-semibold leading-tight">
                  {card.label}
                </div>
                <div className="text-[11px] font-normal opacity-70 leading-tight mt-0.5">
                  {card.tag}
                </div>
              </div>
              <span className="text-base sm:text-lg font-mono font-semibold tracking-tight tabular-nums">
                {card.display}
              </span>
            </button>
          );
        })}

        <div
          className={`min-h-[64px] rounded-2xl pl-4 pr-2.5 py-2.5 border flex items-center justify-between gap-2 transition-colors ${
            isCustomCardActive
              ? "bg-ink text-white border-ink"
              : "bg-canvas text-ink border-hairline shadow-2xs"
          }`}
        >
          <label
            htmlFor="custom-minutes-input"
            className="cursor-pointer shrink-0"
          >
            <span className="text-xs sm:text-sm font-semibold block leading-tight">
              Atur Sendiri
            </span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={120}
              step={0.5}
              data-testid="custom-duration-input"
              id="custom-minutes-input"
              placeholder="Menit"
              value={customMinutes}
              disabled={timerRunning}
              onChange={(e) => onCustomMinutesChange(e.target.value)}
              className="w-20 min-h-[44px] px-2.5 text-center rounded-xl border border-hairline bg-surface text-ink text-xs sm:text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-ink disabled:opacity-40"
            />
            <button
              type="button"
              data-testid="apply-custom-duration-btn"
              disabled={timerRunning || !customMinutes}
              onClick={onApplyCustomMinutes}
              className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold transition-colors inline-flex items-center gap-1 shrink-0 ${
                isCustomValid
                  ? isCustomCardActive
                    ? "bg-accent-lime hover:bg-accent-lime-hover text-ink cursor-pointer"
                    : "bg-ink hover:bg-ink-deep text-white cursor-pointer"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Pakai</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StageControls(props: StageControlsProps) {
  return (
    <>
      <StageActionButtons {...props} />
      <TimerDurationSelector {...props} />
    </>
  );
}
