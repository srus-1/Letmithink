"use client";

import React, { useEffect, useState } from "react";
import { X, Mic, Copy, Check } from "lucide-react";
import type { CoachResult } from "@/lib/types";
import { COACH_MODE_LABELS } from "@/lib/coach/limits";
import { formatTimer } from "@/lib/formatters";

export interface CoachResultModalProps {
  result: CoachResult | null;
  onClose: () => void;
  onNotify?: (msg: string) => void;
}

type TabKey = "overview" | "corrections" | "transcript";

export function CoachResultModal({
  result,
  onClose,
  onNotify,
}: CoachResultModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setActiveTab("overview");
    setCopied(false);
  }, [result]);

  useEffect(() => {
    if (!result) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [result, onClose]);

  if (!result) return null;

  const totalFillers = result.fillerWords.reduce((sum, item) => sum + item.count, 0);
  const isEnglish = result.mode === "en-grammar";

  const handleCopyTranscript = async () => {
    if (!result.transcript) return;
    try {
      await navigator.clipboard.writeText(result.transcript);
      setCopied(true);
      onNotify?.("Transkrip disalin ke papan klip.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify?.("Gagal menyalin transkrip.");
    }
  };

  return (
    <div
      data-testid="coach-result-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="coach-result-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[88vh] bg-canvas rounded-xl shadow-lg border border-hairline flex flex-col overflow-hidden"
      >
        <div className="p-5 sm:p-6 border-b border-hairline flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-ink text-accent-lime flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="coach-result-title"
                  className="text-base sm:text-lg font-semibold text-ink leading-tight"
                >
                  Evaluasi Latihan Bicara
                </h2>
                <span className="px-2 py-0.5 rounded bg-surface border border-hairline text-[11px] font-medium text-ink">
                  {COACH_MODE_LABELS[result.mode]}
                </span>
              </div>
              <p className="text-xs text-ink-slate mt-1 line-clamp-1">
                Topik: <span className="font-medium text-ink">{result.topic || "Tanpa judul"}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-coach-result-btn"
            aria-label="Tutup Evaluasi"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -mt-1 -mr-1 text-ink-slate hover:text-ink flex items-center justify-center rounded-lg hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 sm:px-6 pt-3 border-b border-hairline bg-surface flex flex-wrap items-center justify-between gap-3">
          <div role="tablist" aria-label="Bagian Evaluasi" className="flex items-center gap-1">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "overview"}
              data-testid="coach-tab-overview"
              onClick={() => setActiveTab("overview")}
              className={`min-h-[44px] px-3.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "overview"
                  ? "border-ink text-ink"
                  : "border-transparent text-ink-slate hover:text-ink"
              }`}
            >
              Skor &amp; Saran
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "corrections"}
              data-testid="coach-tab-corrections"
              onClick={() => setActiveTab("corrections")}
              className={`min-h-[44px] px-3.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "corrections"
                  ? "border-ink text-ink"
                  : "border-transparent text-ink-slate hover:text-ink"
              }`}
            >
              <span>Koreksi Kalimat</span>
              {result.corrections.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-surface text-[10px] font-semibold tabular-nums">
                  {result.corrections.length}
                </span>
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "transcript"}
              data-testid="coach-tab-transcript"
              onClick={() => setActiveTab("transcript")}
              className={`min-h-[44px] px-3.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "transcript"
                  ? "border-ink text-ink"
                  : "border-transparent text-ink-slate hover:text-ink"
              }`}
            >
              Transkrip
            </button>
          </div>

          <div className="flex items-center gap-3 pb-2 text-xs text-ink-slate tabular-nums">
            <span>Durasi: <strong className="text-ink">{formatTimer(result.recordedSec)}</strong></span>
            <span>Tempo: <strong className="text-ink">{result.wordsPerMinute} kata/menit</strong></span>
            <span>Filler: <strong className="text-ink">{totalFillers}x</strong></span>
          </div>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === "overview" && (
            <>
              {result.scores.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.scores.map((item) => (
                    <div
                      key={item.label}
                      data-testid="coach-score-card"
                      className="rounded-xl border border-hairline bg-surface p-3.5"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-semibold text-ink">{item.label}</span>
                        <span className="text-base font-semibold text-ink tabular-nums">
                          {item.score}<span className="text-xs font-normal text-ink-slate">/10</span>
                        </span>
                      </div>
                      <p className="text-xs text-ink-slate mt-1.5 leading-relaxed">{item.note}</p>
                    </div>
                  ))}
                </div>
              )}

              {!isEnglish && result.techniques.length > 0 && (
                <div className="rounded-xl border border-hairline bg-canvas p-4">
                  <h3 className="text-xs font-semibold text-ink">
                    Teknik Public Speaking yang Terdengar
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {result.techniques.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 rounded-md bg-accent-lime text-ink text-xs font-semibold border border-ink/15"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.fillerWords.length > 0 && (
                <div className="rounded-xl border border-hairline bg-canvas p-4">
                  <h3 className="text-xs font-semibold text-ink">
                    Kata Pengisi yang Sering Muncul
                  </h3>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {result.fillerWords.map((f) => (
                      <span
                        key={f.word}
                        className="px-2.5 py-1 rounded-md bg-surface border border-hairline text-xs text-ink tabular-nums"
                      >
                        &ldquo;{f.word}&rdquo; <strong className="font-semibold">{f.count}x</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-hairline bg-canvas p-4">
                  <h3 className="text-xs font-semibold text-ink">Sudah Berjalan Baik</h3>
                  {result.strengths.length === 0 ? (
                    <p className="text-xs text-ink-slate mt-2">
                      Belum ada catatan khusus di bagian ini.
                    </p>
                  ) : (
                    <ul className="mt-2.5 space-y-2 text-xs text-ink leading-relaxed list-disc pl-4">
                      {result.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="rounded-xl border border-hairline bg-canvas p-4">
                  <h3 className="text-xs font-semibold text-ink">Latihan Berikutnya</h3>
                  {result.improvements.length === 0 ? (
                    <p className="text-xs text-ink-slate mt-2">
                      Tidak ada catatan perbaikan tambahan.
                    </p>
                  ) : (
                    <ul className="mt-2.5 space-y-2 text-xs text-ink leading-relaxed list-disc pl-4">
                      {result.improvements.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {result.improvedVersion && (
                <div className="rounded-xl border border-ink bg-ink text-white p-4">
                  <h3 className="text-xs font-semibold text-accent-lime">
                    {isEnglish
                      ? "Versi Paragraf Bahasa Inggris yang Sudah Diperbaiki"
                      : "Contoh Pembuka yang Lebih Kuat"}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/95 mt-2 leading-relaxed whitespace-pre-line">
                    {result.improvedVersion}
                  </p>
                </div>
              )}
            </>
          )}

          {activeTab === "corrections" && (
            <>
              {result.corrections.length === 0 ? (
                <div className="rounded-xl border border-hairline bg-surface p-6 text-center text-xs text-ink-slate">
                  Tidak ada kalimat yang perlu dikoreksi dari rekaman ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {result.corrections.map((item, idx) => (
                    <div
                      key={idx}
                      data-testid="coach-correction-item"
                      className="rounded-xl border border-hairline bg-canvas p-4 space-y-2"
                    >
                      <div className="text-xs">
                        <span className="font-semibold text-ink-slate block">Kalimat kamu:</span>
                        <p className="text-ink mt-0.5 line-through decoration-ink/40">
                          {item.original}
                        </p>
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-ink block">Saran perbaikan:</span>
                        <p className="text-ink font-medium mt-0.5 bg-accent-lime/35 px-2 py-1 rounded">
                          {item.suggestion}
                        </p>
                      </div>
                      <p className="text-xs text-ink-slate leading-relaxed">{item.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "transcript" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink">
                  Transkrip Rekaman
                </span>
                {result.transcript && (
                  <button
                    type="button"
                    onClick={handleCopyTranscript}
                    className="min-h-[40px] inline-flex items-center gap-1.5 px-3 rounded-lg border border-hairline bg-surface hover:bg-surface-hover text-xs font-medium text-ink transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Salin Transkrip</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {result.transcript ? (
                <div
                  data-testid="coach-transcript-text"
                  className="rounded-xl border border-hairline bg-surface p-4 text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-line"
                >
                  {result.transcript}
                </div>
              ) : (
                <div className="rounded-xl border border-hairline bg-surface p-6 text-center text-xs text-ink-slate">
                  Suara tidak terdengar jelas sehingga transkrip kosong. Pastikan mikrofon dekat dan ruang tidak bising, lalu coba rekam lagi.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
