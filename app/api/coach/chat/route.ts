import { GoogleGenAI, type Interactions } from "@google/genai";
import type { NextRequest } from "next/server";
import {
  buildChatSystemInstruction,
  COACH_CHAT_MAX_MESSAGE_CHARS,
  COACH_CHAT_MAX_MESSAGES,
  COACH_CHAT_RATE_LIMIT,
} from "@/lib/coach/chat";
import {
  classifyGeminiError,
  createSlidingWindowLimiter,
  getClientIp,
  runWithModelFallback,
} from "@/lib/coach/gemini";
import type { CoachChatResultSummary, CoachMode } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 30;

const MODES: CoachMode[] = ["id-public-speaking", "en-grammar"];
const CHAT_TIMEOUT_MS = 25_000;
const PRIMARY_ATTEMPT_TIMEOUT_MS = 16_000;

const isRateLimited = createSlidingWindowLimiter(
  COACH_CHAT_RATE_LIMIT.maxRequests,
  COACH_CHAT_RATE_LIMIT.windowMs
);

function fail(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

interface RawChatTurn {
  role?: unknown;
  content?: unknown;
}

function sanitizeCues(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    .slice(0, 3)
    .map((item) => item.trim().slice(0, 120));
}

function sanitizeResultSummary(raw: unknown): CoachChatResultSummary | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const mode = obj.mode === "en-grammar" ? "en-grammar" : "id-public-speaking";
  const scores = Array.isArray(obj.scores)
    ? obj.scores
        .slice(0, 4)
        .map((item) => {
          const entry = item as Record<string, unknown>;
          return {
            label: String(entry?.label ?? "").slice(0, 40),
            score: Number(entry?.score) || 0,
            note: String(entry?.note ?? "").slice(0, 180),
          };
        })
        .filter((s) => s.label.length > 0)
    : [];

  return {
    mode,
    topic: String(obj.topic ?? "").slice(0, 300),
    recordedSec: Math.max(0, Math.round(Number(obj.recordedSec) || 0)),
    wordsPerMinute: Math.max(0, Math.round(Number(obj.wordsPerMinute) || 0)),
    transcriptExcerpt: String(obj.transcriptExcerpt ?? "").slice(0, 400),
    scores,
    strengths: Array.isArray(obj.strengths)
      ? obj.strengths.slice(0, 3).map((x) => String(x).slice(0, 200))
      : [],
    improvements: Array.isArray(obj.improvements)
      ? obj.improvements.slice(0, 4).map((x) => String(x).slice(0, 200))
      : [],
    correctionsCount: Math.max(0, Math.round(Number(obj.correctionsCount) || 0)),
  };
}

function sanitizeSteps(rawMessages: unknown): Interactions.Step[] | null {
  if (!Array.isArray(rawMessages)) return null;

  const cleaned = rawMessages
    .map((item) => {
      const turn = item as RawChatTurn;
      const role = turn?.role === "assistant" ? "assistant" : turn?.role === "user" ? "user" : null;
      const text =
        typeof turn?.content === "string"
          ? turn.content.trim().slice(0, COACH_CHAT_MAX_MESSAGE_CHARS)
          : "";
      if (!role || !text) return null;
      return { role, text } as const;
    })
    .filter((t): t is { role: "user" | "assistant"; text: string } => t !== null)
    .slice(-COACH_CHAT_MAX_MESSAGES);

  // Drop leading assistant turns so the stateless history begins cleanly with a user turn.
  const firstUserIdx = cleaned.findIndex((t) => t.role === "user");
  if (firstUserIdx === -1) return null;
  const turns = cleaned.slice(firstUserIdx);

  if (turns[turns.length - 1]?.role !== "user") {
    return null;
  }

  return turns.map((turn): Interactions.Step => {
    if (turn.role === "user") {
      return {
        type: "user_input",
        content: [{ type: "text", text: turn.text }],
      };
    }
    return {
      type: "model_output",
      content: [{ type: "text", text: turn.text }],
    };
  });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fail(
      503,
      "AI Coach chat belum aktif di server ini. Pemilik situs perlu mengisi GEMINI_API_KEY."
    );
  }

  if (isRateLimited(getClientIp(request))) {
    return fail(429, "Batas pesan chat per jam sudah tercapai. Coba lagi nanti.");
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return fail(400, "Format permintaan chat tidak valid.");
  }

  const mode = body.mode as CoachMode;
  if (!MODES.includes(mode)) {
    return fail(400, "Mode AI Coach tidak dikenal.");
  }

  const steps = sanitizeSteps(body.messages);
  if (!steps || steps.length === 0) {
    return fail(400, "Tulis pertanyaan sebelum mengirim pesan ke AI Coach.");
  }

  const topic = String(body.topic ?? "").trim().slice(0, 300);
  const constraint = String(body.constraint ?? "").trim().slice(0, 300) || null;
  const cues = sanitizeCues(body.cues);
  const resultSummary = sanitizeResultSummary(body.resultSummary);

  const client = new GoogleGenAI({ apiKey, apiVersion: "v1beta" });
  const systemInstruction = buildChatSystemInstruction({
    mode,
    topic,
    constraint,
    cues,
    resultSummary,
  });

  const outcome = await runWithModelFallback({
    totalTimeoutMs: CHAT_TIMEOUT_MS,
    primaryTimeoutMs: PRIMARY_ATTEMPT_TIMEOUT_MS,
    logTag: "coach-chat",
    run: (model, timeoutMs) =>
      client.interactions.create(
        {
          model,
          store: false,
          system_instruction: systemInstruction,
          generation_config: {
            thinking_level: "low",
          },
          input: steps,
        },
        { timeout_ms: timeoutMs, retries: { strategy: "none" } }
      ),
  });

  if (outcome.ok) {
    const reply = outcome.value.output_text?.trim();
    if (!reply) {
      return fail(502, "AI Coach tidak mengirim balasan. Coba kirim ulang pertanyaanmu.");
    }
    return Response.json({ reply });
  }

  console.error("[coach-chat] Gemini request failed", outcome.error);
  const kind = classifyGeminiError(outcome.error);
  if (kind === "quota") {
    return fail(429, "Kuota AI sedang penuh. Coba lagi beberapa menit lagi.");
  }
  if (kind === "busy") {
    return fail(503, "AI Coach sedang sibuk sementara. Coba kirim ulang sebentar lagi.");
  }
  if (kind === "timeout") {
    return fail(504, "Balasan AI melebihi batas waktu tunggu. Silakan coba kirim ulang.");
  }
  return fail(502, "Pesan gagal diproses AI Coach. Coba kirim ulang.");
}
