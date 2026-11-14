"use client";

import React, { useEffect, useRef, useState } from "react";
import { ArrowDown, FileText, MessageSquare, Mic, RotateCcw } from "lucide-react";
import { formatTimer } from "@/lib/formatters";
import { COACH_MAX_RECORD_SEC } from "@/lib/coach/limits";
import type { CoachChatMessage, CoachMode, CoachResult, CoachStatus } from "@/lib/types";

export interface CoachChatMessagesProps {
  enabled: boolean;
  mode: CoachMode;
  status: CoachStatus;
  recordedSec: number;
  capped: boolean;
  topic: string;
  constraint: string | null;
  cues: string[];
  result: CoachResult | null;
  messages: CoachChatMessage[];
  sending: boolean;
  chatError: string | null;
  onOpenResult: () => void;
  onRetryChat: () => void;
  onDismissChatError: () => void;
}

function renderFormattedText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold text-inherit">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function CoachAvatar() {
  return (
    <div
      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#0D1117] text-accent-lime shadow-2xs"
      aria-hidden="true"
    >
      <MessageSquare className="h-3.5 w-3.5" />
    </div>
  );
}

function buildIntroMessage({
  enabled,
  mode,
  topic,
  constraint,
  cues,
}: {
  enabled: boolean;
  mode: CoachMode;
  topic: string;
  constraint: string | null;
  cues: string[];
}): string {
  const modeLabel = mode === "en-grammar" ? "English Grammar" : "Public Speaking";
  const parts: string[] = [];

  if (topic) {
    parts.push(
      `Siap mendampingi latihan topik "${topic}" di mode ${modeLabel}.`
    );
  } else {
    parts.push(
      `Saya siap mendampingi latihanmu di mode ${modeLabel}.`
    );
  }

  if (constraint) {
    parts.push(`Tantangan aktif: ${constraint}.`);
  }

  const filledCues = cues.map((c) => c.trim()).filter(Boolean);
  if (filledCues.length > 0) {
    parts.push(`Kerangka 3 poinmu sudah terbaca (${filledCues.length} poin).`);
  }

  parts.push(
    enabled
      ? "Mic sudah aktif. Tekan Mulai Timer untuk rekam, atau tanyakan strategi bicara di chat ini dulu."
      : "Kamu bisa tanya strategi atau latihan skrip langsung di sini, atau aktifkan Mic di kanan atas agar saya nilai rekaman suaramu."
  );

  return parts.join(" ");
}

function buildActivityText(status: CoachStatus, recordedSec: number, capped: boolean): string | null {
  switch (status) {
    case "preparing":
      return "Meminta izin mikrofon browser...";
    case "recording":
      return `Sedang merekam suara: ${formatTimer(recordedSec)} dari batas ${formatTimer(COACH_MAX_RECORD_SEC)}.`;
    case "paused":
      return capped
        ? "Rekaman mencapai batas 10 menit. Lanjutkan presentasi, nanti saya analisis bagian awalmu."
        : `Rekaman dijeda pada ${formatTimer(recordedSec)}.`;
    case "analyzing":
      return `Rekaman ${formatTimer(recordedSec)} selesai. Saya sedang mendengarkan dan menyusun feedback...`;
    default:
      return null;
  }
}

export function CoachChatMessages(props: CoachChatMessagesProps) {
  const {
    enabled,
    mode,
    status,
    recordedSec,
    capped,
    topic,
    constraint,
    cues,
    result,
    messages,
    sending,
    chatError,
    onOpenResult,
    onRetryChat,
    onDismissChatError,
  } = props;

  const threadRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const prevResultRef = useRef<CoachResult | null>(null);
  const [showJumpButton, setShowJumpButton] = useState(false);

  const scrollToBottom = (forceSmooth = false) => {
    const el = threadRef.current;
    if (!el) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: forceSmooth && !prefersReduced ? "smooth" : "auto",
    });
    stickToBottomRef.current = true;
    setShowJumpButton(false);
  };

  const handleScroll = () => {
    const el = threadRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom < 48;
    stickToBottomRef.current = nearBottom;
    setShowJumpButton(!nearBottom);
  };

  useEffect(() => {
    const resultJustArrived = Boolean(result && result !== prevResultRef.current);
    prevResultRef.current = result;

    if (stickToBottomRef.current || resultJustArrived) {
      const el = threadRef.current;
      if (!el) return;
      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const shouldSmooth = messages.length > 0 || resultJustArrived;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: shouldSmooth && !prefersReduced ? "smooth" : "auto",
      });
      stickToBottomRef.current = true;
    }
  }, [messages.length, sending, chatError, result, status]);

  const introText = buildIntroMessage({ enabled, mode, topic, constraint, cues });
  const activityText = buildActivityText(status, recordedSec, capped);

  return (
    <div className="relative bg-surface">
      <div
        ref={threadRef}
        onScroll={handleScroll}
        role="log"
        aria-label="Percakapan AI Coach"
        aria-relevant="additions"
        data-testid="coach-chat-thread"
        className="h-[250px] sm:h-[276px] overflow-y-auto px-3.5 py-4 sm:px-5 space-y-3.5 scroll-smooth motion-reduce:scroll-auto"
      >
        {/* Dynamic welcome message grounded to current topic, mode, and mic state */}
        <div className="flex items-start gap-2.5">
          <CoachAvatar />
          <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-hairline bg-canvas px-3.5 py-2.5 text-[13px] leading-relaxed text-ink shadow-2xs">
            <p>{introText}</p>
          </div>
        </div>

        {/* Live recording / processing activity card */}
        {activityText && (
          <div className="flex items-start gap-2.5">
            <div
              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-2xs ${
                status === "recording"
                  ? "bg-red-700 text-white"
                  : "bg-[#0D1117] text-accent-lime"
              }`}
              aria-hidden="true"
            >
              <Mic className="h-3.5 w-3.5" />
            </div>
            <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-hairline-strong bg-canvas px-3.5 py-2.5 text-[13px] text-ink shadow-2xs">
              <div className="flex items-center gap-2">
                {status === "recording" && (
                  <span
                    className="h-2 w-2 rounded-full bg-red-600 animate-pulse motion-reduce:animate-none shrink-0"
                    aria-hidden="true"
                  />
                )}
                <span className="font-medium leading-relaxed">{activityText}</span>
              </div>
            </div>
          </div>
        )}

        {/* Evaluation summary bubble when a speech recording finishes */}
        {result && (
          <div className="flex items-start gap-2.5" data-testid="coach-result-bubble">
            <CoachAvatar />
            <div className="w-full max-w-[92%] rounded-2xl rounded-tl-sm border border-hairline-strong bg-canvas p-3.5 text-ink shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-2.5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-slate">
                    Hasil Analisis Rekaman
                  </p>
                  <p className="text-sm font-semibold text-ink mt-0.5">
                    {result.topic || "Latihan Bicara"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-ink-slate">
                  <span className="rounded-md border border-hairline bg-surface px-2 py-1 text-ink tabular-nums">
                    {formatTimer(result.recordedSec)}
                  </span>
                  <span className="rounded-md border border-hairline bg-surface px-2 py-1 text-ink tabular-nums">
                    {result.wordsPerMinute} WPM
                  </span>
                </div>
              </div>

              {result.scores.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {result.scores.slice(0, 4).map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-hairline bg-surface px-2.5 py-2"
                    >
                      <p className="text-[11px] font-medium text-ink-slate truncate">
                        {item.label}
                      </p>
                      <p className="text-sm font-bold text-ink tabular-nums mt-0.5">
                        {item.score}
                        <span className="text-xs font-normal text-ink-slate">/10</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {result.improvements[0] && (
                <p className="mt-3 text-xs leading-relaxed text-ink-slate">
                  <strong className="font-semibold text-ink">Fokus utama: </strong>
                  {result.improvements[0]}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid="coach-open-result"
                  onClick={onOpenResult}
                  className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-accent-lime px-4 py-2 text-xs font-bold text-ink hover:bg-accent-lime-hover transition-colors"
                >
                  <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Lihat Feedback</span>
                </button>
                <span className="text-xs text-ink-slate">
                  Atau tanyakan langsung detailnya di bawah.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User and assistant Q&A conversation bubbles */}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          if (isUser) {
            return (
              <div key={msg.id} className="flex justify-end" data-testid="coach-chat-msg-user">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#0D1117] px-3.5 py-2.5 text-[13px] leading-relaxed text-canvas shadow-xs whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className="flex items-start gap-2.5"
              data-testid="coach-chat-msg-assistant"
            >
              <CoachAvatar />
              <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-hairline bg-canvas px-3.5 py-2.5 text-[13px] leading-relaxed text-ink shadow-2xs whitespace-pre-wrap break-words">
                {renderFormattedText(msg.content)}
              </div>
            </div>
          );
        })}

        {/* Typing indicator bubble while awaiting Gemini reply */}
        {sending && (
          <div className="flex items-start gap-2.5" data-testid="coach-chat-typing">
            <CoachAvatar />
            <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-hairline bg-canvas px-3.5 py-3 shadow-2xs">
              <span className="sr-only">AI Coach sedang mengetik balasan</span>
              <span
                className="h-2 w-2 rounded-full bg-ink-slate animate-bounce motion-reduce:animate-none [animation-delay:-0.2s]"
                aria-hidden="true"
              />
              <span
                className="h-2 w-2 rounded-full bg-ink-slate animate-bounce motion-reduce:animate-none [animation-delay:-0.1s]"
                aria-hidden="true"
              />
              <span
                className="h-2 w-2 rounded-full bg-ink-slate animate-bounce motion-reduce:animate-none"
                aria-hidden="true"
              />
            </div>
          </div>
        )}

        {/* Chat error recovery bubble */}
        {chatError && (
          <div className="flex items-start gap-2.5" role="alert" data-testid="coach-chat-error">
            <CoachAvatar />
            <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-900 shadow-2xs space-y-2">
              <p className="font-medium leading-relaxed">{chatError}</p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onRetryChat}
                  className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-[#0D1117] px-3 py-1.5 text-xs font-semibold text-canvas hover:bg-black/85 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Kirim Ulang</span>
                </button>
                <button
                  type="button"
                  onClick={onDismissChatError}
                  className="min-h-[44px] inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-900 hover:bg-red-100 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showJumpButton && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <button
            type="button"
            onClick={() => scrollToBottom(true)}
            aria-label="Gulir ke pesan terbaru"
            className="pointer-events-auto min-h-[44px] inline-flex items-center gap-1.5 rounded-full border border-hairline-strong bg-canvas px-3.5 py-1.5 text-xs font-semibold text-ink shadow-md hover:bg-surface-hover transition-colors"
          >
            <ArrowDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Pesan terbaru</span>
          </button>
        </div>
      )}
    </div>
  );
}
