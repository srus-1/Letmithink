"use client";

import React, { useEffect } from "react";
import { X, Archive, ArchiveRestore, RotateCcw } from "lucide-react";

export interface ArchiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  archivedTitles: string[];
  onRestoreAll: () => void;
  onRestoreSingle: (title: string) => void;
  onNotify: (msg: string) => void;
}

export function ArchiveDrawer({
  isOpen,
  onClose,
  archivedTitles,
  onRestoreAll,
  onRestoreSingle,
  onNotify,
}: ArchiveDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="archive-drawer"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-0 sm:p-4 bg-black/50 animate-in fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-drawer-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md h-full sm:h-[90vh] bg-canvas sm:rounded-xl shadow-xl border border-hairline p-6 flex flex-col justify-between relative animate-in slide-in-from-right"
      >
        <div className="shrink-0">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-ink text-accent-lime flex items-center justify-center">
                <Archive className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h3 id="archive-drawer-title" className="text-base sm:text-lg font-semibold text-ink">
                  Laci Arsip Topik
                </h3>
                <span className="text-xs font-normal text-ink-slate tabular-nums">
                  {archivedTitles.length} topik tersimpan di arsip
                </span>
              </div>
            </div>

            <button
              type="button"
              data-testid="close-archive-drawer-btn"
              aria-label="Tutup Laci Arsip"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] text-ink-slate hover:text-ink flex items-center justify-center rounded-lg hover:bg-surface transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {archivedTitles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-ink-slate text-xs">
              <Archive className="w-10 h-10 mb-2 opacity-30 text-ink-slate" aria-hidden="true" />
              <span>Arsip masih kosong. Topik yang selesai dibawakan akan tersimpan di sini.</span>
            </div>
          ) : (
            <ul className="space-y-2">
              {archivedTitles.map((title, idx) => (
                <li
                  key={`${idx}-${title}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-hairline text-xs"
                >
                  <span className="text-ink font-normal">
                    <span className="font-medium text-ink-slate tabular-nums mr-1">
                      {idx + 1}.
                    </span>
                    {title}
                  </span>

                  <button
                    type="button"
                    data-testid={`restore-item-${idx}`}
                    aria-label={`Pulihkan topik ${title}`}
                    onClick={() => {
                      onRestoreSingle(title);
                      onNotify(`Topik ${title} dikembalikan ke antrean aktif.`);
                    }}
                    className="min-h-[44px] min-w-[44px] p-2 text-ink-slate hover:text-ink rounded-lg hover:bg-canvas transition-colors cursor-pointer flex items-center justify-center shrink-0"
                    title="Pulihkan ke Antrean"
                  >
                    <RotateCcw className="w-4 h-4 text-ink" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 pt-4 border-t border-hairline space-y-2">
          <button
            type="button"
            data-testid="restore-all-btn"
            disabled={archivedTitles.length === 0}
            onClick={() => {
              onRestoreAll();
              onNotify("Semua judul dari arsip berhasil dikembalikan.");
            }}
            className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-ink hover:bg-ink-deep text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
          >
            <ArchiveRestore className="w-4 h-4" aria-hidden="true" />
            <span>Kembalikan Semua ke Antrean</span>
          </button>
        </div>
      </div>
    </div>
  );
}
