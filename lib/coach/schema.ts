import type { CoachMode, CoachResult } from "@/lib/types";

const stringArray = { type: "array", items: { type: "string" } } as const;

export const COACH_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    transcript: { type: "string" },
    wordsPerMinute: { type: "integer" },
    fillerWords: {
      type: "array",
      items: {
        type: "object",
        properties: { word: { type: "string" }, count: { type: "integer" } },
        required: ["word", "count"],
      },
    },
    scores: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string" },
          score: { type: "integer" },
          note: { type: "string" },
        },
        required: ["label", "score", "note"],
      },
    },
    techniques: stringArray,
    corrections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          original: { type: "string" },
          suggestion: { type: "string" },
          reason: { type: "string" },
        },
        required: ["original", "suggestion", "reason"],
      },
    },
    strengths: stringArray,
    improvements: stringArray,
    improvedVersion: { type: "string" },
  },
  required: [
    "transcript",
    "wordsPerMinute",
    "fillerWords",
    "scores",
    "techniques",
    "corrections",
    "strengths",
    "improvements",
    "improvedVersion",
  ],
} as const;

const asString = (v: unknown) => (typeof v === "string" ? v : "");
const asStrings = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);
const clampScore = (v: unknown) => Math.min(10, Math.max(1, Math.round(Number(v) || 1)));

// The schema constrains the model, but the payload still crosses a trust boundary into the UI.
export function normalizeCoachResult(
  raw: unknown,
  meta: { mode: CoachMode; topic: string; recordedSec: number }
): CoachResult {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const list = (v: unknown) => (Array.isArray(v) ? v : []) as Record<string, unknown>[];

  return {
    ...meta,
    transcript: asString(r.transcript),
    wordsPerMinute: Math.max(0, Math.round(Number(r.wordsPerMinute) || 0)),
    fillerWords: list(r.fillerWords)
      .map((f) => ({ word: asString(f.word), count: Math.max(0, Math.round(Number(f.count) || 0)) }))
      .filter((f) => f.word && f.count > 0),
    scores: list(r.scores).map((s) => ({
      label: asString(s.label),
      score: clampScore(s.score),
      note: asString(s.note),
    })),
    techniques: asStrings(r.techniques),
    corrections: list(r.corrections)
      .map((c) => ({
        original: asString(c.original),
        suggestion: asString(c.suggestion),
        reason: asString(c.reason),
      }))
      .filter((c) => c.original && c.suggestion),
    strengths: asStrings(r.strengths),
    improvements: asStrings(r.improvements),
    improvedVersion: asString(r.improvedVersion),
  };
}
