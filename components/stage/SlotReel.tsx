"use client";

import React from "react";

export interface SlotReelProps {
  isSpinning: boolean;
  reelSequence: string[];
  reelOffset: number;
  activeSlotIndex: number;
  activeTitles: string[];
  selectedConstraint?: string | null;
}

export function SlotReel({
  isSpinning,
  reelSequence,
  reelOffset,
  activeSlotIndex,
  activeTitles,
  selectedConstraint,
}: SlotReelProps) {
  const leadBufferTitle =
    activeTitles.length > 0
      ? activeTitles[(activeTitles.length - 1) % activeTitles.length]
      : "";

  return (
    <div
      data-testid="spin-drum-container"
      className="relative w-full overflow-hidden select-none"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-16 z-20"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 z-20"
        style={{
          background:
            "linear-gradient(0deg, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0) 100%)",
        }}
      />

      <div
        data-testid="center-highlight-frame"
        className="pointer-events-none absolute inset-x-0 top-[96px] h-[96px] z-10 rounded-xl border-2 border-ink bg-accent-lime/25 flex items-center justify-between px-3.5"
      >
        <div className="w-1.5 h-6 rounded-full bg-ink" />
        <div className="w-1.5 h-6 rounded-full bg-ink" />
      </div>

      <div
        data-testid="slot-reel-viewport"
        className="relative w-full h-[288px] overflow-hidden"
      >
        {activeTitles.length === 0 ? (
          <div className="h-full flex items-center justify-center p-6 text-center text-ink-slate font-sans text-sm">
            Daftar judul kosong. Tambahkan topik baru di bawah atau pulihkan dari arsip.
          </div>
        ) : (
          <div
            data-testid="spin-reel-sequence"
            className="w-full absolute left-0 top-[96px]"
            style={{
              transform: `translate3d(0, -${Math.round(reelOffset)}px, 0)`,
              willChange: "transform",
            }}
          >
            <div className="w-full h-[96px] -mt-[96px] grid place-items-center px-8 sm:px-14 text-center text-ink-slate/45 select-none text-sm sm:text-base font-normal truncate">
              {leadBufferTitle}
            </div>

            {reelSequence.map((title, idx) => {
              const isCenter = idx === activeSlotIndex;
              return (
                <div
                  key={`${idx}-${title}`}
                  data-testid={`slot-reel-item-${idx}`}
                  id={`spin-slot-item-${idx}`}
                  className={`w-full h-[96px] grid place-items-center px-8 sm:px-14 text-center transition-opacity duration-100 ${
                    isCenter
                      ? "text-ink font-semibold text-base sm:text-xl md:text-2xl opacity-100"
                      : "text-ink-slate font-normal text-sm sm:text-lg opacity-40"
                  }`}
                >
                  <span
                    data-testid={isCenter ? "active-topic-heading" : undefined}
                    className="block max-w-2xl leading-snug max-h-[3.2em] overflow-hidden"
                  >
                    {title}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="sr-only">
        <span data-testid="spin-status-label">
          {isSpinning
            ? "Menggulir daftar topik..."
            : activeTitles.length === 0
            ? "Menunggu topik baru"
            : "Topik Terpilih"}
        </span>
        {selectedConstraint && (
          <span
            data-testid="active-constraint-text"
            id="active-constraint-subtext"
          >
            Tantangan: {selectedConstraint}
          </span>
        )}
      </div>
    </div>
  );
}
