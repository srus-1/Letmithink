"use client";

import React, { useEffect } from "react";
import { X, Sliders, Volume2, Zap, SlidersHorizontal, RotateCcw, Mic } from "lucide-react";
import { STORAGE_KEY } from "@/lib/constants";

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  curveballEnabled: boolean;
  onToggleCurveball: () => void;
  useConstraintReel: boolean;
  onToggleConstraintReel: () => void;
  coachEnabled?: boolean;
  onToggleCoach?: () => void;
  onResetToDefaults: () => void;
  onNotify: (msg: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  soundEnabled,
  onToggleSound,
  curveballEnabled,
  onToggleCurveball,
  useConstraintReel,
  onToggleConstraintReel,
  coachEnabled = false,
  onToggleCoach,
  onResetToDefaults,
  onNotify,
}: SettingsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReset = () => {
    if (window.confirm("Apakah Anda yakin ingin mengatur ulang semua data topik, riwayat, dan tantangan ke bawaan awal?")) {
      onResetToDefaults();
      onClose();
      onNotify("Semua data telah diatur ulang ke kondisi awal.");
    }
  };

  return (
    <div
      data-testid="settings-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-canvas rounded-xl shadow-lg border border-hairline p-6 relative"
      >
        <button
          type="button"
          data-testid="close-settings-btn"
          aria-label="Tutup Pengaturan"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] absolute top-4 right-4 text-ink-slate hover:text-ink flex items-center justify-center rounded-lg hover:bg-surface transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-ink text-accent-lime flex items-center justify-center">
            <Sliders className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 id="settings-modal-title" className="text-base sm:text-lg font-semibold text-ink">
              Pengaturan Aplikasi
            </h3>
            <span className="text-xs font-normal text-ink-slate">
              Preferensi suara, tantangan, dan penyimpanan lokal
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface border border-hairline">
            <div className="flex items-center gap-2.5 min-w-0">
              <Volume2 className="w-4 h-4 text-ink shrink-0" aria-hidden="true" />
              <div className="text-xs">
                <span className="font-semibold text-ink block">
                  Efek Suara Sintesis
                </span>
                <span className="text-ink-slate text-[11px] font-normal">
                  Detent klik putaran dan nada selesai putaran topik.
                </span>
              </div>
            </div>

            <label
              aria-label="Alihkan Efek Suara"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer select-none shrink-0"
            >
              <input
                type="checkbox"
                role="switch"
                aria-checked={soundEnabled}
                aria-label="Alihkan Efek Suara"
                checked={soundEnabled}
                onChange={onToggleSound}
                className="appearance-none w-8 h-[18px] rounded-full bg-slate-300 checked:bg-ink relative cursor-pointer transition-colors shrink-0 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[14px] after:h-[14px] after:rounded-full after:bg-white checked:after:bg-accent-lime checked:after:translate-x-[14px] after:transition-transform focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface border border-hairline">
            <div className="flex items-center gap-2.5 min-w-0">
              <Zap className="w-4 h-4 text-ink shrink-0" aria-hidden="true" />
              <div className="text-xs">
                <span className="font-semibold text-ink block">
                  Selaan Dadakan
                </span>
                <span className="text-ink-slate text-[11px] font-normal">
                  Tantangan improvisasi otomatis saat sisa 45 detik.
                </span>
              </div>
            </div>

            <label
              aria-label="Alihkan Selaan Dadakan"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer select-none shrink-0"
            >
              <input
                type="checkbox"
                role="switch"
                aria-checked={curveballEnabled}
                aria-label="Alihkan Selaan Dadakan"
                checked={curveballEnabled}
                onChange={onToggleCurveball}
                className="appearance-none w-8 h-[18px] rounded-full bg-slate-300 checked:bg-ink relative cursor-pointer transition-colors shrink-0 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[14px] after:h-[14px] after:rounded-full after:bg-white checked:after:bg-accent-lime checked:after:translate-x-[14px] after:transition-transform focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface border border-hairline">
            <div className="flex items-center gap-2.5 min-w-0">
              <SlidersHorizontal className="w-4 h-4 text-ink shrink-0" aria-hidden="true" />
              <div className="text-xs">
                <span className="font-semibold text-ink block">
                  Pasangan Tantangan
                </span>
                <span className="text-ink-slate text-[11px] font-normal">
                  Pasangkan aturan pembawaan bicara saat drum diputar.
                </span>
              </div>
            </div>

            <label
              aria-label="Alihkan Pasangan Tantangan"
              className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer select-none shrink-0"
            >
              <input
                type="checkbox"
                role="switch"
                aria-checked={useConstraintReel}
                aria-label="Alihkan Pasangan Tantangan"
                checked={useConstraintReel}
                onChange={onToggleConstraintReel}
                className="appearance-none w-8 h-[18px] rounded-full bg-slate-300 checked:bg-ink relative cursor-pointer transition-colors shrink-0 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[14px] after:h-[14px] after:rounded-full after:bg-white checked:after:bg-accent-lime checked:after:translate-x-[14px] after:transition-transform focus:outline-none focus:ring-2 focus:ring-ink/20"
              />
            </label>
          </div>

          {onToggleCoach && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-surface border border-hairline">
              <div className="flex items-center gap-2.5 min-w-0">
                <Mic className="w-4 h-4 text-ink shrink-0" aria-hidden="true" />
                <div className="text-xs">
                  <span className="font-semibold text-ink block">
                    Rekam &amp; Evaluasi AI Coach
                  </span>
                  <span className="text-ink-slate text-[11px] font-normal">
                    Rekam suara saat timer berjalan hingga 10 menit untuk transkrip dan koreksi.
                  </span>
                </div>
              </div>

              <label
                aria-label="Alihkan AI Coach"
                className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] cursor-pointer select-none shrink-0"
              >
                <input
                  type="checkbox"
                  role="switch"
                  aria-checked={coachEnabled}
                  aria-label="Alihkan AI Coach"
                  checked={coachEnabled}
                  onChange={onToggleCoach}
                  className="appearance-none w-8 h-[18px] rounded-full bg-slate-300 checked:bg-ink relative cursor-pointer transition-colors shrink-0 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[14px] after:h-[14px] after:rounded-full after:bg-white checked:after:bg-accent-lime checked:after:translate-x-[14px] after:transition-transform focus:outline-none focus:ring-2 focus:ring-ink/20"
                />
              </label>
            </div>
          )}

          <div className="pt-3 border-t border-hairline">
            <div className="text-[11px] font-normal text-ink-slate mb-2">
              Kunci penyimpanan lokal: <code className="font-semibold text-ink">{STORAGE_KEY}</code>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-ink hover:bg-ink-deep text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-accent-lime" aria-hidden="true" />
              <span>Kembalikan Semua Data ke Kondisi Awal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
