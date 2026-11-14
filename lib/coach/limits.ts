// Shared by the browser recorder and the API route so both enforce the same caps.
export const COACH_MAX_RECORD_SEC = 600;
export const COACH_MIN_RECORD_SEC = 5;
export const COACH_AUDIO_BITRATE = 32_000;
// Inline audio requests are capped at 20 MB by Gemini; base64 adds ~33%, so stay well under.
export const COACH_MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
export const COACH_RATE_LIMIT = { maxRequests: 10, windowMs: 60 * 60 * 1000 };

// Keep full AI transcripts capped in localStorage so older queue items never overflow browser quota.
export const COACH_HISTORY_MAX_DETAILS = 20;

export const COACH_MODE_LABELS = {
  "id-public-speaking": "Public Speaking Bahasa Indonesia",
  "en-grammar": "Grammar Bahasa Inggris",
} as const;
