"use client";

import React from "react";
import { ArchiveRestore, Eye, RotateCcw } from "lucide-react";

export interface ArchiveCardProps {
  archivedTitles: string[];
  onRestoreAll: () => void;
  onRestoreSingle: (title: string) => void;
  onOpenDrawer: () => void;
  onNotify: (msg: string) => void;
}

export function ArchiveCard({
  archivedTitles,
  onRestoreAll,
  onRestoreSingle,
  onOpenDrawer,
  onNotify,
}: ArchiveCardProps) {
  const handleRestoreAll = () => {
    if (archivedTitles.length === 0) return;
    onRestoreAll();
    onNotify("Semua judul dari arsip berhasil dikembalikan ke antrean aktif.");
  };

  return (
    <div
      id="arsip-selesai"
      className="flex-1 rounded-xl p-3.5 bg-accent-lime text-ink border border-ink/15 shadow-xs flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h2 className="text-sm sm:text-base font-semibold tracking-tight text-ink leading-tight">
            Arsip Topik Selesai
          </h2>
          <span
            data-testid="archived-count-badge"
            className="px-2.5 py-0.5 rounded-md bg-ink text-accent-lime text-sm font-semibold tabular-nums"
          >
            {archivedTitles.length}
          </span>
        </div>

        <p className="text-xs text-ink/80 font-normal leading-snug mb-2.5">
          Topik yang selesai dibawakan disisihkan otomatis agar tidak terulang.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          data-testid="restore-all-btn"
          id="restore-all-archived-btn"
          aria-label="Kembalikan Semua Judul ke Antrean"
          disabled={archivedTitles.length === 0}
          onClick={handleRestoreAll}
          className="min-h-[44px] w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-ink hover:bg-ink-deep text-accent-lime text-xs font-semibold transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
        >
          <ArchiveRestore className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Kembalikan</span>
        </button>

        <button
          type="button"
          data-testid="open-archive-drawer-btn"
          aria-label="Buka Laci Arsip Lengkap"
          onClick={onOpenDrawer}
          className="min-h-[44px] w-full inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-canvas hover:bg-surface text-ink border border-ink/15 text-xs font-semibold transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-ink" aria-hidden="true" />
          <span>Lihat Arsip</span>
        </button>
      </div>

      {archivedTitles.length > 0 && (
        <div className="bg-canvas text-ink rounded-lg p-2 mt-2 border border-ink/10">
          <ul className="space-y-0.5 max-h-20 overflow-y-auto pr-1">
            {archivedTitles.slice(0, 5).map((title, idx) => (
              <li
                key={`${idx}-${title}`}
                className="flex items-center justify-between gap-2 text-xs py-0.5 px-1.5 rounded hover:bg-surface transition-colors"
              >
                <span className="truncate text-ink font-normal">
                  {title}
                </span>
                <button
                  type="button"
                  data-testid={`restore-item-${idx}`}
                  aria-label={`Pulihkan topik ${title}`}
                  onClick={() => {
                    onRestoreSingle(title);
                    onNotify(`Topik ${title} dikembalikan ke antrean.`);
                  }}
                  className="min-h-[36px] min-w-[36px] p-1.5 text-ink-slate hover:text-ink transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  title="Pulihkan Topik Ini"
                >
                  <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
