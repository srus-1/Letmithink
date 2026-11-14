"use client";

import React, { useId, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  RotateCcw,
  SendHorizontal,
  Trash2,
} from "lucide-react";
import { COACH_CHAT_MAX_MESSAGE_CHARS, getQuickPrompts } from "@/lib/coach/chat";
import { COACH_MAX_RECORD_SEC } from "@/lib/coach/limits";
import { formatTimer } from "@/lib/formatters";
import type { CoachChatMessage, CoachMode, CoachResult, CoachStatus } from "@/lib/types";
import { CoachChatMessages } from "./CoachChatMessages";

export interface CoachPanelProps {
  enabled: boolean;
  onToggle: () => void;
  mode: CoachMode;
  onSelectMode: (mode: CoachMode) => void;
  status: CoachStatus;
  recordedSec: number;
  capped: boolean;
  error: string | null;
  hasResult: boolean;
  canRetry?: boolean;
  onRetry?: () => void;
  onContinueWithoutAi?: () => void;
  onOpenResult: () => void;
  onDismissError: () => void;
  targetSec: number;
  topic?: string;
  constraint?: string | null;
  cues?: string[];
  result?: CoachResult | null;
  chatMessages?: CoachChatMessage[];
  chatSending?: boolean;
  chatError?: string | null;
  onSendChat?: (message: string) => void | Promise<void>;
  onRetryChat?: () => void | Promise<void>;
  onClearChat?: () => void;
  onDismissChatError?: () => void;
}

const MODES: CoachMode[] = ["id-public-speaking", "en-grammar"];

function StatusLine({
  enabled,
  status,
  recordedSec,
  capped,
  targetSec,
}: Pick<CoachPanelProps, "enabled" | "status" | "recordedSec" | "capped" | "targetSec">) {
  if (!enabled) {
    return (
      <span>
        Nyalakan untuk merekam latihanmu. Setelah timer habis, kamu dapat transkrip dan koreksi.
      </span>
    );
  }
  switch (status) {
    case "preparing":
      return <span>Menyiapkan izin mikrofon...</span>;
    case "recording":
      return (
        <span className="inline-flex items-center gap-2 text-canvas font-medium">
          <span
            className="w-2 h-2 rounded-full bg-red-500 animate-pulse motion-reduce:animate-none"
            aria-hidden="true"
          />
          Merekam {formatTimer(recordedSec)} dari maks. {formatTimer(COACH_MAX_RECORD_SEC)}
        </span>
      );
    case "paused":
      return capped ? (
        <span>Batas 10 menit tercapai. Sisa waktu bicara tidak ikut dianalisis.</span>
      ) : (
        <span>Rekaman dijeda di {formatTimer(recordedSec)}.</span>
      );
    case "analyzing":
      return (
        <span className="inline-flex items-center gap-2 text-canvas font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none shrink-0" aria-hidden="true" />
          Menganalisis rekaman {formatTimer(recordedSec)}. Jangan tutup halaman ini.
        </span>
      );
    case "done":
      return <span>Feedback sudah siap. Buka untuk melihat transkrip dan koreksinya.</span>;
    default:
      return targetSec > COACH_MAX_RECORD_SEC ? (
        <span>Mikrofon menyala saat kamu menekan Mulai Timer. Hanya 10 menit pertama yang dianalisis.</span>
      ) : (
        <span>Mikrofon menyala saat kamu menekan Mulai Timer.</span>
      );
  }
}

export function CoachPanel(props: CoachPanelProps) {
  const {
    enabled,
    onToggle,
    mode,
    onSelectMode,
    status,
    recordedSec,
    capped,
    error,
    hasResult,
    canRetry = false,
    onRetry,
    onContinueWithoutAi,
    onOpenResult,
    onDismissError,
    topic = "",
    constraint = null,
    cues = [],
    result = null,
    chatMessages = [],
    chatSending = false,
    chatError = null,
    onSendChat,
    onRetryChat,
    onClearChat,
    onDismissChatError,
  } = props;

  const inputId = useId();
  const [draft, setDraft] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const locked =
    status === "preparing" ||
    status === "recording" ||
    status === "paused" ||
    status === "analyzing";

  const quickPrompts = getQuickPrompts(mode, Boolean(result));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const clean = draft.trim();
    if (!clean || chatSending || !onSendChat) return;
    setDraft("");
    void onSendChat(clean);
  };

  return (
    <section
      aria-label="AI Coach Chatbot"
      data-testid="coach-panel"
      className="rounded-2xl border border-hairline-strong bg-canvas shadow-sm overflow-hidden"
    >
      {/* Chatbot Top Header */}
      <div className="bg-[#0D1117] px-4 py-3 sm:px-5 text-canvas">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                enabled ? "bg-accent-lime text-ink" : "bg-white/10 text-canvas border border-white/15"
              }`}
              aria-hidden="true"
            >
              {status === "recording" ? (
                <Mic className="w-4 h-4" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-canvas leading-tight">AI Coach</h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    enabled
                      ? "bg-accent-lime text-ink"
                      : "bg-white/10 text-[#E5E7EB]"
                  }`}
                >
                  {enabled ? (
                    <Mic className="h-3 w-3 shrink-0" aria-hidden="true" />
                  ) : (
                    <MicOff className="h-3 w-3 shrink-0" aria-hidden="true" />
                  )}
                  <span>{enabled ? "Mic Aktif" : "Mode Chat"}</span>
                </span>
              </div>
              <p
                data-testid="coach-status"
                aria-live="polite"
                className="text-xs text-[#E5E7EB] mt-1 leading-relaxed"
              >
                <StatusLine {...props} />
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div
              role="group"
              aria-label="Mode AI Coach"
              className="inline-flex rounded-lg border border-white/15 bg-white/5 p-1"
            >
              {MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  data-testid={`coach-mode-${m}`}
                  aria-pressed={mode === m}
                  disabled={locked}
                  onClick={() => onSelectMode(m)}
                  className={`min-h-[40px] sm:min-h-[44px] px-3 rounded-md text-xs font-semibold transition-colors focus-visible:outline-accent-lime focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    mode === m
                      ? "bg-accent-lime text-ink"
                      : "text-[#E5E7EB] hover:text-canvas hover:bg-white/10"
                  }`}
                >
                  {m === "id-public-speaking" ? "Public Speaking" : "English Grammar"}
                </button>
              ))}
            </div>

            <label
              aria-label="Alihkan AI Coach"
              className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg px-2 cursor-pointer select-none ${
                locked ? "opacity-55 cursor-not-allowed" : "hover:bg-white/10"
              }`}
            >
              <input
                type="checkbox"
                role="switch"
                aria-checked={enabled}
                aria-label="Alihkan AI Coach"
                data-testid="coach-toggle"
                disabled={locked}
                checked={enabled}
                onChange={onToggle}
                className="appearance-none w-9 h-5 rounded-full bg-white/25 border border-white/25 checked:bg-accent-lime checked:border-accent-lime relative cursor-pointer transition-colors shrink-0 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-[14px] after:h-[14px] after:rounded-full after:bg-canvas checked:after:bg-[#0D1117] checked:after:translate-x-[16px] after:transition-transform focus-visible:outline-accent-lime focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed"
              />
            </label>

            {hasResult && (!result || collapsed) && (
              <button
                type="button"
                data-testid="coach-open-result"
                onClick={onOpenResult}
                className="min-h-[44px] inline-flex items-center gap-2 px-3.5 rounded-lg bg-accent-lime hover:bg-accent-lime-hover text-ink text-xs font-bold transition-colors focus-visible:outline-accent-lime focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Lihat Feedback</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-expanded={!collapsed}
              aria-label={collapsed ? "Buka jendela chat AI Coach" : "Ciutkan jendela chat AI Coach"}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 text-[#E5E7EB] hover:bg-white/15 hover:text-canvas transition-colors focus-visible:outline-accent-lime focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {collapsed ? (
                <ChevronDown className="w-4 h-4 shrink-0" aria-hidden="true" />
              ) : (
                <ChevronUp className="w-4 h-4 shrink-0" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Speech / Microphone Error Alert (always visible regardless of scroll or collapse) */}
      {error && (
        <div
          role="alert"
          data-testid="coach-error"
          className="border-b border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900 sm:px-5"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-2 flex-1 min-w-0">
              <p className="font-medium leading-relaxed">{error}</p>
              {canRetry && onRetry && (
                <p className="text-[11px] text-red-800">
                  Rekaman tersimpan sementara hingga sesi baru dimulai.
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {canRetry && onRetry && (
                  <button
                    type="button"
                    data-testid="coach-retry-btn"
                    onClick={onRetry}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D1117] hover:bg-black/85 text-canvas text-xs font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Coba Analisis Ulang</span>
                  </button>
                )}
                {onContinueWithoutAi && (
                  <button
                    type="button"
                    data-testid="coach-continue-without-ai-btn"
                    onClick={onContinueWithoutAi}
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-red-300 bg-white hover:bg-red-100 text-red-900 text-xs font-semibold transition-colors"
                  >
                    <span>Lanjut Tanpa AI</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onDismissError}
                  className="min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium text-red-800 hover:bg-red-100 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Chat Thread + Composer */}
      {!collapsed && (
        <>
          <CoachChatMessages
            enabled={enabled}
            mode={mode}
            status={status}
            recordedSec={recordedSec}
            capped={capped}
            topic={topic}
            constraint={constraint}
            cues={cues}
            result={result}
            messages={chatMessages}
            sending={chatSending}
            chatError={chatError}
            onOpenResult={onOpenResult}
            onRetryChat={() => {
              if (onRetryChat) void onRetryChat();
            }}
            onDismissChatError={() => {
              if (onDismissChatError) onDismissChatError();
            }}
          />

          <div className="border-t border-hairline bg-canvas px-3.5 py-3 sm:px-5">
            {onSendChat && (
              <>
                <div
                  className="flex flex-wrap items-center gap-2"
                  aria-label="Saran pertanyaan cepat"
                >
                  {quickPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      data-testid="coach-quick-prompt"
                      disabled={chatSending}
                      onClick={() => void onSendChat(prompt)}
                      className="min-h-[44px] inline-flex items-center rounded-lg border border-hairline bg-surface-soft px-3 py-1.5 text-left text-xs font-medium text-ink hover:bg-surface-hover hover:border-hairline-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="mt-2.5 flex items-center gap-2">
                  <label htmlFor={inputId} className="sr-only">
                    Tulis pertanyaan untuk AI Coach
                  </label>
                  <input
                    id={inputId}
                    type="text"
                    data-testid="coach-chat-input"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    maxLength={COACH_CHAT_MAX_MESSAGE_CHARS}
                    disabled={chatSending}
                    placeholder={
                      mode === "en-grammar"
                        ? "Tanya grammar, kosakata, atau minta contoh pembuka..."
                        : "Tanya pembuka presentasi, struktur argumen, atau tips tempo..."
                    }
                    className="min-h-[44px] min-w-0 flex-1 rounded-lg border border-hairline-strong bg-surface-soft px-3.5 text-sm text-ink placeholder:text-ink-slate focus:border-ink focus:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
                  />

                  {chatMessages.length > 0 && onClearChat && (
                    <button
                      type="button"
                      data-testid="coach-chat-clear"
                      onClick={onClearChat}
                      disabled={chatSending}
                      aria-label="Hapus riwayat chat"
                      title="Hapus riwayat chat"
                      className="min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center rounded-lg border border-hairline bg-surface-soft text-ink-slate hover:bg-surface-hover hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Trash2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </button>
                  )}

                  <button
                    type="submit"
                    data-testid="coach-chat-send"
                    disabled={chatSending || !draft.trim()}
                    className="min-h-[44px] shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0D1117] px-4 text-xs sm:text-sm font-semibold text-canvas hover:bg-black/85 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
                  >
                    {chatSending ? (
                      <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none shrink-0" aria-hidden="true" />
                    ) : (
                      <SendHorizontal className="w-4 h-4 shrink-0" aria-hidden="true" />
                    )}
                    <span>{chatSending ? "Mengirim..." : "Kirim"}</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
