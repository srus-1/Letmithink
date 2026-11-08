/**
 * Formatting and Text Utility Functions for PutarTopik
 * Strictly adheres to Catalis style and Anti-Slop (zero em dashes)
 */

/**
 * Cap each cue note at 5 words so speakers write triggers instead of reading scripts.
 * Splits by whitespace, keeps first 5 words.
 */
export function capFiveWords(raw: string): string {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  if (tokens.length <= 5) return raw;
  return tokens.slice(0, 5).join(" ") + " ";
}

/**
 * Counts word tokens in a string.
 */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Format seconds into MM:SS (clamped at 00:00 when countdown finishes).
 */
export function formatTimer(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const rem = clamped % 60;
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

/**
 * Format seconds into HH:MM:SS (clamped at 00:00:00 when countdown finishes).
 */
export function formatGiantClock(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const rem = clamped % 60;
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

/**
 * Format date for session history timestamp (Indonesian locale).
 */
export function formatIndonesianDate(date: Date = new Date()): string {
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
