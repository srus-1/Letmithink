import { GoogleGenAI } from "@google/genai";
import type { NextRequest } from "next/server";
import type { CoachMode } from "@/lib/types";
import { buildSystemInstruction, buildUserPrompt } from "@/lib/coach/prompts";
import { COACH_RESPONSE_SCHEMA, normalizeCoachResult } from "@/lib/coach/schema";
import {
  classifyGeminiError,
  createSlidingWindowLimiter,
  getClientIp,
  runWithModelFallback,
} from "@/lib/coach/gemini";
import {
  COACH_MAX_RECORD_SEC,
  COACH_MAX_UPLOAD_BYTES,
  COACH_MIN_RECORD_SEC,
  COACH_RATE_LIMIT,
} from "@/lib/coach/limits";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODES: CoachMode[] = ["id-public-speaking", "en-grammar"];
const GEMINI_TIMEOUT_MS = 55_000;
const PRIMARY_ATTEMPT_TIMEOUT_MS = 35_000;
const isRateLimited = createSlidingWindowLimiter(
  COACH_RATE_LIMIT.maxRequests,
  COACH_RATE_LIMIT.windowMs
);

// Browsers report container types with codec params; Gemini wants the bare type.
const MIME_MAP: Record<string, string> = {
  "audio/webm": "audio/webm",
  "audio/ogg": "audio/ogg",
  "audio/mp4": "audio/m4a",
  "audio/m4a": "audio/m4a",
  "audio/x-m4a": "audio/m4a",
  "audio/aac": "audio/aac",
  "audio/mpeg": "audio/mpeg",
  "audio/wav": "audio/wav",
};

function parseCues(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, 3)
      .map((item) => item.trim().slice(0, 120));
  } catch {
    return [];
  }
}

function resolveAudioMimeType(rawType: string): string | undefined {
  const base = rawType.split(";")[0].trim().toLowerCase();
  if (!base) return "audio/webm";
  return MIME_MAP[base];
}

function fail(status: number, message: string) {
  return Response.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fail(503, "AI Coach belum aktif di server ini. Pemilik situs perlu mengisi GEMINI_API_KEY.");
  }

  if (isRateLimited(getClientIp(request))) {
    return fail(429, "Batas 10 analisis per jam sudah tercapai. Coba lagi nanti.");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "Data rekaman tidak terbaca. Coba rekam ulang.");
  }

  const audio = form.get("audio");
  const mode = form.get("mode") as CoachMode;
  const topic = String(form.get("topic") ?? "").slice(0, 300);
  const constraint = String(form.get("constraint") ?? "").slice(0, 300) || null;
  const recordedSec = Math.round(Number(form.get("recordedSec")) || 0);
  const cues = parseCues(form.get("cues"));

  if (!(audio instanceof Blob) || audio.size === 0) {
    return fail(400, "Rekaman kosong. Pastikan mikrofon menangkap suara kamu.");
  }
  if (audio.size > COACH_MAX_UPLOAD_BYTES) {
    return fail(413, "Rekaman terlalu besar untuk dianalisis.");
  }
  if (!MODES.includes(mode)) {
    return fail(400, "Mode AI Coach tidak dikenal.");
  }
  if (recordedSec < COACH_MIN_RECORD_SEC) {
    return fail(400, `Rekaman terlalu pendek. Bicara minimal ${COACH_MIN_RECORD_SEC} detik.`);
  }
  // Small grace for MediaRecorder flushing its last chunk after the 10-minute stop.
  if (recordedSec > COACH_MAX_RECORD_SEC + 5) {
    return fail(400, "AI Coach hanya menganalisis maksimal 10 menit rekaman.");
  }

  const mimeType = resolveAudioMimeType(audio.type);
  if (!mimeType) {
    return fail(415, "Format audio dari browser ini belum didukung.");
  }

  const data = Buffer.from(await audio.arrayBuffer()).toString("base64");
  const client = new GoogleGenAI({ apiKey, apiVersion: "v1beta" });
  const systemInstruction = buildSystemInstruction(mode);
  const userPrompt = buildUserPrompt({ topic, constraint, recordedSec, cues });

  const outcome = await runWithModelFallback({
    totalTimeoutMs: GEMINI_TIMEOUT_MS,
    primaryTimeoutMs: PRIMARY_ATTEMPT_TIMEOUT_MS,
    logTag: "coach",
    run: (model, timeoutMs) =>
      client.interactions.create(
        {
          model,
          store: false,
          system_instruction: systemInstruction,
          generation_config: {
            thinking_level: "low",
          },
          input: [
            { type: "text", text: userPrompt },
            { type: "audio", data, mime_type: mimeType as "audio/webm" },
          ],
          response_format: {
            type: "text",
            mime_type: "application/json",
            schema: COACH_RESPONSE_SCHEMA,
          },
        },
        // Disable SDK multi-minute 503 backoff so fallback and client timeouts stay predictable.
        { timeout_ms: timeoutMs, retries: { strategy: "none" } }
      ),
  });

  if (outcome.ok) {
    const text = outcome.value.output_text;
    if (!text) {
      return fail(502, "AI tidak mengirim hasil. Klik Coba Analisis Ulang atau rekam lagi.");
    }
    const result = normalizeCoachResult(JSON.parse(text), { mode, topic, recordedSec });
    return Response.json({ result });
  }

  console.error("[coach] Gemini request failed", outcome.error);
  const kind = classifyGeminiError(outcome.error);
  if (kind === "quota") {
    return fail(429, "Kuota AI sedang penuh. Coba lagi beberapa menit lagi.");
  }
  if (kind === "busy") {
    return fail(503, "Layanan AI sedang sibuk sementara. Klik Coba Analisis Ulang beberapa saat lagi.");
  }
  if (kind === "timeout") {
    return fail(504, "Analisis melebihi batas waktu tunggu. Silakan coba analisis ulang.");
  }
  return fail(502, "Analisis gagal di sisi AI. Rekaman kamu tidak disimpan di server, silakan coba ulang.");
}
