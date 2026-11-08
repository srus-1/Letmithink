"use client";

import React from "react";
import { StageSignal } from "@/lib/types";
import { formatGiantClock } from "@/lib/formatters";

export interface TimerClockProps {
  remainingSec: number;
  stageSignal: StageSignal;
  activeTopic: string | null;
  activeConstraint: string | null;
}

export function TimerClock({
  remainingSec,
  stageSignal,
  activeTopic,
  activeConstraint,
}: TimerClockProps) {
  const formattedTime = formatGiantClock(remainingSec);

  return (
    <div
      data-testid="giant-clock-display"
      className="w-full flex flex-col items-center justify-center py-4 sm:py-5 px-4 select-none"
    >
      <div
        data-testid="stage-signal-badge"
        id="timer-signal-badge"
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-2 transition-colors ${
          stageSignal.pillClass || stageSignal.badgeBg
        }`}
      >
        <span
          data-testid="timer-signal-dot"
          className={`w-2 h-2 rounded-full ${stageSignal.dotColor || "bg-ink"}`}
        />
        <span>{stageSignal.label}</span>
      </div>

      <div
        data-testid="timer-display"
        className={`w-full text-center font-sans font-medium leading-[0.88] tracking-[-0.055em] tabular-nums py-2 sm:py-4 transition-colors ${
          stageSignal.digitColor || "text-[#0D1117]"
        }`}
        style={{
          fontSize: "clamp(4.25rem, 15.5vw, 12.75rem)",
        }}
      >
        {formattedTime}
      </div>

      <div className="mt-2.5 text-center max-w-xl px-2">
        <div
          data-testid="timer-active-topic-text"
          className="font-semibold text-base sm:text-lg text-ink line-clamp-2"
        >
          {activeTopic || "Belum ada topik dipilih (putar ide terlebih dahulu)"}
        </div>
        {activeConstraint && (
          <p className="mt-1 text-xs font-medium text-ink-slate">
            Tantangan: {activeConstraint}
          </p>
        )}
      </div>
    </div>
  );
}
