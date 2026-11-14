"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Trash2, FileText } from "lucide-react";
import { SessionRecord, SessionStats, CoachResult } from "@/lib/types";
import { formatTimer } from "@/lib/formatters";

export interface StatsCardProps {
  sessions: SessionRecord[];
  stats: SessionStats;
  onClearSessions: () => void;
  onNotify: (msg: string) => void;
  onOpenCoachResult?: (result: CoachResult) => void;
}

export function StatsCard({
  sessions,
  stats,
  onClearSessions,
  onNotify,
  onOpenCoachResult,
}: StatsCardProps) {
  const handleClear = () => {
    if (sessions.length === 0) return;
    onClearSessions();
    onNotify("Riwayat sesi latihan telah dibersihkan.");
  };

  const hasSessions = stats.totalSessions > 0;

  return (
    <div
      id="riwayat-sesi"
      className="w-full rounded-2xl p-5 sm:p-6 bg-[#F4F5F7] text-[#0D1117] border border-slate-200 shadow-2xs flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <h2 className="text-base font-semibold tracking-tight text-[#0D1117] leading-tight">
            Statistik &amp; Riwayat
          </h2>

          {sessions.length > 0 && (
            <button
              type="button"
              data-testid="clear-history-btn"
              aria-label="Bersihkan Seluruh Riwayat Sesi"
              onClick={handleClear}
              className="min-h-[44px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-600 hover:text-[#0D1117] inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Bersihkan</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white text-[#0D1117] rounded-xl p-3 border border-slate-200/80">
            <div className="text-[11px] font-normal text-slate-500">
              Total Sesi
            </div>
            <div
              data-testid="stat-total-speeches"
              className="text-base sm:text-lg font-semibold text-[#0D1117] tabular-nums mt-0.5"
            >
              {stats.totalSessions}
            </div>
          </div>

          <div
            className={`rounded-xl p-3 border transition-colors ${
              hasSessions
                ? "bg-[#0D1117] text-white border-[#0D1117]"
                : "bg-white text-[#0D1117] border-slate-200/80"
            }`}
          >
            <div
              className={`text-[11px] ${
                hasSessions ? "font-medium text-white/75" : "font-normal text-slate-500"
              }`}
            >
              Tepat Waktu
            </div>
            <div
              data-testid="stat-ontime-rate"
              id="stats-ontime-rate"
              className={`text-base sm:text-lg font-semibold tabular-nums mt-0.5 ${
                hasSessions ? "text-white" : "text-[#0D1117]"
              }`}
            >
              {stats.onTimeRate}%
            </div>
          </div>

          <div className="col-span-2 bg-white text-[#0D1117] rounded-xl px-3.5 py-3 border border-slate-200/80 flex items-center justify-between gap-2">
            <div className="text-xs font-normal text-slate-500">
              Rata-rata Durasi
            </div>
            <div
              data-testid="stat-avg-duration"
              id="stats-avg-duration"
              className="text-base sm:text-lg font-semibold text-[#0D1117] tabular-nums"
            >
              {formatTimer(stats.avgSec)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="text-[11px] font-medium text-slate-600 flex items-center justify-between mb-3 pb-2 border-b border-slate-200 bg-[#F4F5F7]">
          <span>Catatan Sesi Terakhir</span>
          <span className="tabular-nums">
            {sessions.length} tersimpan
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="flex-1 min-h-[240px] rounded-xl bg-white/70 border border-slate-200/80 flex items-center justify-center p-6 text-center text-xs text-slate-500">
            Belum ada sesi yang direkam.
          </div>
        ) : (
          <div className="flex-1 min-h-[240px] max-h-[300px] overflow-y-auto pt-2 pb-4 px-1 space-y-2.5">
            {sessions.map((session, idx) => {
              const isShortTest = (session.spokenSec || 0) < 15;
              const isOnTime = !isShortTest && session.overtimeSec === 0;

              return (
                <div
                  key={session.id || idx}
                  data-testid={`session-log-card-${idx}`}
                  className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                        isShortTest
                          ? "bg-slate-200 text-slate-700"
                          : isOnTime
                          ? "bg-slate-900 text-white"
                          : "bg-slate-900 text-[#C6FF33]"
                      }`}
                    >
                      {isShortTest ? (
                        <span>Sesi Singkat</span>
                      ) : isOnTime ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                          <span>Tepat Waktu</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 text-[#C6FF33]" aria-hidden="true" />
                          <span>Lewat +{session.overtimeSec}d</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] font-normal text-slate-500 tabular-nums">
                      {session.timestamp}
                    </span>
                  </div>

                  <div className="font-semibold text-[#0D1117] line-clamp-2 leading-snug">
                    {session.title}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-normal text-slate-500 tabular-nums">
                    <span>
                      Bicara {formatTimer(session.spokenSec)} / Target {formatTimer(session.targetSec)}
                    </span>
                    {session.constraint && (
                      <span className="text-[#0D1117] line-clamp-1 max-w-[140px]">
                        {session.constraint}
                      </span>
                    )}
                  </div>

                  {session.coach && onOpenCoachResult && (
                    <button
                      type="button"
                      data-testid={`session-coach-btn-${idx}`}
                      onClick={() => onOpenCoachResult(session.coach!)}
                      className="min-h-[36px] w-full mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D1117] hover:bg-black text-white text-[11px] font-medium transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#C6FF33]" aria-hidden="true" />
                      <span>Lihat Feedback AI</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
