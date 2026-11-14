import type { CoachChatResultSummary, CoachMode, CoachResult } from "@/lib/types";

export const COACH_CHAT_MAX_MESSAGES = 12;
export const COACH_CHAT_MAX_MESSAGE_CHARS = 800;
export const COACH_CHAT_RATE_LIMIT = {
  maxRequests: 30,
  windowMs: 60 * 60 * 1000,
} as const;

export interface ChatContextInput {
  mode: CoachMode;
  topic: string;
  constraint: string | null;
  cues?: string[];
  resultSummary?: CoachChatResultSummary | null;
}

export function summarizeCoachResult(result: CoachResult): CoachChatResultSummary {
  return {
    mode: result.mode,
    topic: result.topic,
    recordedSec: result.recordedSec,
    wordsPerMinute: result.wordsPerMinute,
    transcriptExcerpt: result.transcript.slice(0, 400),
    scores: result.scores.slice(0, 4).map((s) => ({
      label: s.label,
      score: s.score,
      note: s.note.slice(0, 180),
    })),
    strengths: result.strengths.slice(0, 3),
    improvements: result.improvements.slice(0, 4),
    correctionsCount: result.corrections.length,
  };
}

export function buildChatSystemInstruction({
  mode,
  topic,
  constraint,
  cues,
  resultSummary,
}: ChatContextInput): string {
  const persona =
    mode === "en-grammar"
      ? [
          "Kamu adalah pelatih bahasa Inggris percakapan dan presentasi untuk pembelajar Indonesia.",
          "Jelaskan konsep grammar, vocabulary, dan pronunciation dalam Bahasa Indonesia yang ringkas dan mudah dipraktikkan, sementara contoh kalimat bahasa Inggris tetap ditulis dalam Bahasa Inggris.",
        ].join(" ")
      : [
          "Kamu adalah pelatih public speaking berbahasa Indonesia untuk latihan bicara spontan.",
          "Bantu pengguna menyusun pembuka, struktur argumen, transisi, pengendalian tempo, dan penutup yang meyakinkan.",
        ].join(" ");

  const cleanCues = (cues ?? []).map((item) => item.trim()).filter(Boolean).slice(0, 3);
  const contextLines = [
    `Mode aktif: ${mode === "en-grammar" ? "English Grammar" : "Public Speaking"}`,
    `Topik saat ini: ${topic || "belum dipilih"}`,
    `Tantangan bicara: ${constraint || "tidak ada tantangan"}`,
    cleanCues.length > 0
      ? `Kerangka 3 poin pengguna: ${cleanCues.map((c, idx) => `${idx + 1}. ${c}`).join(" | ")}`
      : "Kerangka 3 poin pengguna: belum diisi",
  ];

  if (resultSummary) {
    const scoreText = resultSummary.scores
      .map((s) => `${s.label} ${s.score}/10 (${s.note})`)
      .join("; ");
    contextLines.push(
      `Hasil rekaman terbaru (${resultSummary.recordedSec} dtk, ${resultSummary.wordsPerMinute} WPM, ${resultSummary.correctionsCount} koreksi):`,
      scoreText ? `Skor: ${scoreText}` : "Skor: belum tersedia",
      resultSummary.strengths.length > 0
        ? `Kekuatan: ${resultSummary.strengths.join(" | ")}`
        : "",
      resultSummary.improvements.length > 0
        ? `Fokus perbaikan: ${resultSummary.improvements.join(" | ")}`
        : "",
      resultSummary.transcriptExcerpt
        ? `Cuplikan transkrip: "${resultSummary.transcriptExcerpt}"`
        : ""
    );
  } else {
    contextLines.push("Status rekaman: pengguna belum merekam suara untuk topik ini.");
  }

  const rules = [
    "Aturan jawaban:",
    "- Bicara langsung memakai 'kamu', hangat tapi to the point, tanpa basa-basi pembuka yang klise.",
    "- Jangan memakai em dash. Gunakan koma, titik, atau titik dua.",
    "- Gunakan paragraf pendek atau bullet singkat maksimal 150 kata, kecuali pengguna meminta contoh skrip utuh.",
    "- Jika memberikan contoh kalimat pembuka atau frasa, berikan contoh yang langsung bisa diucapkan dengan suara keras.",
  ].join("\n");

  return [persona, "", contextLines.filter(Boolean).join("\n"), "", rules].join("\n");
}

export function getQuickPrompts(mode: CoachMode, hasResult: boolean): string[] {
  if (hasResult) {
    return mode === "en-grammar"
      ? [
          "Explain my main grammar fixes",
          "Rewrite my opening naturally",
          "Pronunciation drill for next take",
        ]
      : [
          "Kenapa skor saya segini?",
          "Perbaiki kalimat pembuka saya",
          "Latihan 1 menit untuk sesi berikutnya",
        ];
  }

  return mode === "en-grammar"
    ? [
        "Give me a 15s English hook",
        "Key vocabulary for this topic",
        "Natural transition phrases",
      ]
    : [
        "Bantu buat pembuka 15 detik",
        "Struktur 3 poin dari topik ini",
        "Tips jaga tempo biar tidak gugup",
      ];
}
