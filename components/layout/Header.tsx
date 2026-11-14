"use client";

import React from "react";
import Image from "next/image";
import { Sliders, Shuffle, Timer } from "lucide-react";
import { StageMode } from "@/lib/types";

export interface HeaderProps {
  activeCount: number;
  stageMode: StageMode;
  onSelectStageMode: (mode: StageMode) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenSettings: () => void;
}

export function Header({
  activeCount,
  stageMode,
  onSelectStageMode,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header
      data-testid="navbar"
      className="sticky top-0 z-40 w-full bg-canvas border-b border-hairline py-1.5 px-5 sm:px-10 lg:px-16"
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-2 sm:gap-3 h-11">
        <div className="flex items-center shrink-0">
          <Image
            src="/logo-letmithink.webp"
            alt="Letmithink"
            width={136}
            height={32}
            priority
            className="h-5 sm:h-8 w-auto object-contain select-none"
          />
          <span className="sr-only">letmithink</span>
        </div>

        <div
          role="tablist"
          aria-label="Pilih mode panggung"
          className="flex items-center bg-surface p-0.5 rounded-lg border border-hairline shrink-0"
        >
          <button
            type="button"
            data-testid="mode-spin-btn"
            id="stage-mode-spin-btn"
            aria-label="Mode Putar Topik"
            onClick={() => onSelectStageMode("SPIN")}
            className={`h-8 px-2 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              stageMode === "SPIN"
                ? "bg-ink text-accent-lime shadow-2xs"
                : "text-ink-slate hover:text-ink hover:bg-canvas"
            }`}
          >
            <Shuffle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Putar Ide</span>
          </button>

          <button
            type="button"
            data-testid="mode-timer-btn"
            id="stage-mode-timer-btn"
            aria-label="Mode Timer Panggung"
            onClick={() => onSelectStageMode("TIMER")}
            className={`h-8 px-2 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              stageMode === "TIMER"
                ? "bg-ink text-accent-lime shadow-2xs"
                : "text-ink-slate hover:text-ink hover:bg-canvas"
            }`}
          >
            <Timer className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="sm:hidden">Timer</span>
            <span className="hidden sm:inline">Timer Panggung</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href="#kelola-topik"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface border border-hairline text-xs font-normal text-ink-slate hover:text-ink hover:border-ink transition-colors"
          >
            <span
              data-testid="active-topic-counter"
              className="font-semibold text-ink tabular-nums"
            >
              {activeCount}
            </span>
            <span>topik siap</span>
          </a>

          <button
            type="button"
            data-testid="open-settings-btn"
            aria-label="Buka Pengaturan Aplikasi"
            onClick={onOpenSettings}
            className="w-11 h-11 min-w-[44px] min-h-[44px] shrink-0 p-2.5 rounded-lg bg-canvas hover:bg-surface border border-hairline text-ink flex items-center justify-center transition-colors cursor-pointer"
            title="Pengaturan Aplikasi"
          >
            <Sliders className="w-4 h-4 text-ink" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
