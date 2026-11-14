/**
 * Core Domain Types for PutarTopik - Presentation Spinner & Speech Timer
 */

export type StageMode = "SPIN" | "TIMER";

export type TimerState = "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED";

export interface SessionRecord {
  id: string;                  // Unique timestamp ID (`${Date.now()}`)
  title: string;               // Presentation topic presented
  constraint: string | null;   // Speech challenge rule applied (if enabled)
  targetSec: number;           // Target duration in seconds
  spokenSec: number;           // Actual time spoken in seconds
  overtimeSec: number;         // Overtime in seconds (Math.max(0, spokenSec - targetSec))
  timestamp: string;           // Formatted date string (e.g. "08 Nov, 03:30")
  coach?: CoachResult;         // AI feedback, present only when AI Coach was on
}

export type CoachMode = "id-public-speaking" | "en-grammar";

export type CoachStatus =
  | "idle"
  | "preparing"
  | "recording"
  | "paused"
  | "analyzing"
  | "done"
  | "error";

export interface CoachCorrection {
  original: string;
  suggestion: string;
  reason: string;
}

export interface CoachScore {
  label: string;
  score: number;               // 1-10
  note: string;
}

export interface CoachResult {
  mode: CoachMode;
  topic: string;
  recordedSec: number;
  transcript: string;
  wordsPerMinute: number;
  fillerWords: { word: string; count: number }[];
  scores: CoachScore[];
  techniques: string[];
  corrections: CoachCorrection[];
  strengths: string[];
  improvements: string[];
  improvedVersion: string;
}

export interface DurationCard {
  id: "1m" | "2m" | "3m" | "5m" | string;
  label: string;               // "Kilat", "Standar", "Mendalam", "Presentasi"
  tag: string;                 // "Pemanasan", "Latihan Inti", "Argumen Utuh", "Sesi Penuh"
  sec: number;                 // 60, 120, 180, 300
  display: string;             // "01:00", "02:00", "03:00", "05:00"
}

export type DurationPreset = DurationCard;

export interface StageSignal {
  label: string;               // e.g. "Siap Mulai", "Fase Awal", "50% Durasi Tercapai", "Sisa 30 Detik", "Sisa 10 Detik", "Lewat Waktu"
  color: string;               // Digit color or text color
  badgeBg: string;             // Background class for status badge
  dotColor?: string;           // Dot indicator background color
  pillClass?: string;          // Pill badge styling classes
  digitColor?: string;         // Dedicated clock digit color
}

export interface ArchivedTopic {
  id: string;
  title: string;
  archivedAt: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  curveballEnabled: boolean;
  useConstraintReel: boolean;
}

export type CueNotes = [string, string, string];

export interface SessionStats {
  onTimeRate: number;          // Percentage (0-100)
  avgSec: number;              // Average duration in seconds
  totalSessions: number;
}

export interface PutarTopikStoragePayload {
  activeTitles: string[];
  archivedTitles: string[];
  constraints: string[];
  useConstraintReel: boolean;
  soundEnabled: boolean;
  sessions: SessionRecord[];
  settings?: AppSettings;
}

export type CoachChatRole = "user" | "assistant";

export interface CoachChatMessage {
  id: string;
  role: CoachChatRole;
  content: string;
  createdAt: number;
  kind?: "chat" | "summary" | "status";
}

export interface CoachChatResultSummary {
  mode: CoachMode;
  topic: string;
  recordedSec: number;
  wordsPerMinute: number;
  transcriptExcerpt: string;
  scores: { label: string; score: number; note: string }[];
  strengths: string[];
  improvements: string[];
  correctionsCount: number;
}
