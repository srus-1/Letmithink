"use client";

import React from "react";
import { X, Zap } from "lucide-react";
import { CueNotes } from "@/lib/types";

export interface CueNotesBarProps {
  notes: CueNotes;
  onNoteChange: (index: number, text: string) => void;
  getWordCount: (index: number) => number;
  curveballEnabled: boolean;
  onToggleCurveball: () => void;
  activeCurveball: string;
  onDismissCurveball: () => void;
}

export function CueNotesBar({
  notes,
  onNoteChange,
  getWordCount,
  curveballEnabled,
  onToggleCurveball,
  activeCurveball,
  onDismissCurveball,
}: CueNotesBarProps) {
  const cueLabels = [
    { num: "01", placeholder: "Pembuka atau pemicu awal" },
    { num: "02", placeholder: "Argumen atau contoh inti" },
    { num: "03", placeholder: "Simpulan atau kalimat penutup" },
  ];

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentText: string
  ) => {
    // Allow navigation, deletion, selection, and shortcuts
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Tab" ||
      e.key === "Home" ||
      e.key === "End" ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    const words = currentText.trim().split(/\s+/).filter(Boolean);
    // Block adding a 6th word when already at 5 words and pressing Space or typing after trailing space
    if (words.length >= 5 && (e.key === " " || currentText.endsWith(" "))) {
      e.preventDefault();
    }
  };

  return (
    <div className="w-full space-y-2.5">
      {activeCurveball && (
        <div
          data-testid="curveball-banner"
          id="curveball-alert-banner"
          className="w-full p-3 rounded-lg bg-accent-lime text-ink border border-ink flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-md bg-ink text-accent-lime shrink-0">
              <Zap className="w-4 h-4" aria-hidden="true" />
            </span>
            <div className="text-xs sm:text-sm font-semibold">
              <span className="text-[11px] font-medium block text-ink/75">
                Selaan Dadakan
              </span>
              <span>{activeCurveball}</span>
            </div>
          </div>

          <button
            type="button"
            data-testid="dismiss-curveball-btn"
            aria-label="Tutup Tantangan Selaan"
            onClick={onDismissCurveball}
            className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-lg bg-ink hover:bg-ink-deep text-accent-lime text-xs font-medium inline-flex items-center gap-1 cursor-pointer transition-colors shrink-0"
          >
            <span>Tutup</span>
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xs sm:text-sm font-semibold text-ink">
          Kerangka Bicara
        </h2>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-ink">
            Selaan Dadakan
          </span>
          <label
            aria-label="Alihkan Selaan Dadakan"
            className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer select-none"
          >
            <input
              type="checkbox"
              role="switch"
              aria-checked={curveballEnabled}
              data-testid="toggle-curveball-setting"
              id="curveball-checkbox"
              aria-label="Alihkan Selaan Dadakan"
              checked={curveballEnabled}
              onChange={onToggleCurveball}
              className="appearance-none w-8 h-[18px] rounded-full bg-slate-300 checked:bg-ink relative cursor-pointer transition-colors shrink-0 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[14px] after:h-[14px] after:rounded-full after:bg-white checked:after:bg-accent-lime checked:after:translate-x-[14px] after:transition-transform focus:outline-none focus:ring-2 focus:ring-ink/20"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-1">
        {cueLabels.map((cue, idx) => {
          const count = getWordCount(idx);
          const isFull = count >= 5;

          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 bg-surface rounded-xl border border-hairline px-3.5 py-2 min-h-[46px] focus-within:border-ink focus-within:bg-canvas transition-colors"
            >
              <label
                htmlFor={`cue-note-input-${idx}`}
                className="text-xs font-mono text-slate-400 font-semibold shrink-0 cursor-pointer tabular-nums"
              >
                {cue.num}
              </label>

              <input
                type="text"
                maxLength={60}
                data-testid={`cue-input-${idx}`}
                id={`cue-note-input-${idx}`}
                aria-label={`Catatan Isyarat Poin ${cue.num}`}
                placeholder={cue.placeholder}
                value={notes[idx]}
                onKeyDown={(e) => handleInputKeyDown(e, notes[idx])}
                onChange={(e) => onNoteChange(idx, e.target.value)}
                className="w-full min-w-0 bg-transparent text-xs text-ink placeholder:text-slate-400 focus:outline-none"
              />

              <span
                data-testid={`cue-word-count-${idx}`}
                className={`text-[11px] font-mono tabular-nums px-1.5 py-0.5 rounded shrink-0 ${
                  isFull
                    ? "bg-ink text-white font-semibold"
                    : "bg-surface text-slate-500 font-normal"
                }`}
              >
                {count}/5
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
