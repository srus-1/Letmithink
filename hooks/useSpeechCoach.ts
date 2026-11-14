"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CoachMode, CoachResult, CoachStatus } from "@/lib/types";
import {
  COACH_AUDIO_BITRATE,
  COACH_MAX_RECORD_SEC,
  COACH_MAX_UPLOAD_BYTES,
  COACH_MIN_RECORD_SEC,
} from "@/lib/coach/limits";

const PREFS_KEY = "letmithink_coach_prefs";
const CLIENT_UPLOAD_TIMEOUT_MS = 65_000;
const MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];

export interface CoachSessionMeta {
  topic: string;
  constraint: string | null;
  cues?: string[];
}

interface RetainedPayload {
  blob: Blob;
  recordedSec: number;
  meta: CoachSessionMeta;
  onAttach?: (result: CoachResult) => void;
}

export interface SpeechCoachReturn {
  enabled: boolean;
  setEnabled: (val: boolean) => void;
  mode: CoachMode;
  setMode: (mode: CoachMode) => void;
  status: CoachStatus;
  recordedSec: number;
  capped: boolean;
  error: string | null;
  result: CoachResult | null;
  hasRecording: boolean;
  canRetry: boolean;
  start: () => Promise<boolean>;
  pause: () => void;
  discard: () => void;
  finish: (meta: CoachSessionMeta) => Promise<CoachResult | null>;
  retry: () => Promise<CoachResult | null>;
  bindArchiveSession: (onAttach: (result: CoachResult) => void) => void;
  clearResult: () => void;
}

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t));
}

function micErrorMessage(err: unknown): string {
  const name = (err as { name?: string })?.name;
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Izin mikrofon ditolak. Buka izin situs di browser, lalu mulai timer lagi.";
  }
  if (name === "NotFoundError") {
    return "Mikrofon tidak ditemukan. Sambungkan mikrofon, lalu mulai timer lagi.";
  }
  return "Mikrofon tidak bisa dipakai. Kamu bisa mencoba lagi atau lanjut tanpa AI Coach.";
}

export function useSpeechCoach(): SpeechCoachReturn {
  const [enabled, setEnabledState] = useState(false);
  const [mode, setModeState] = useState<CoachMode>("id-public-speaking");
  const [status, setStatus] = useState<CoachStatus>("idle");
  const [recordedSec, setRecordedSec] = useState(0);
  const [capped, setCapped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [canRetry, setCanRetry] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const secRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const preparingRef = useRef(false);
  const prepTokenRef = useRef(0);
  const analysisSeqRef = useRef(0);
  const uiRunIdRef = useRef(0);
  const latestAnalysisRunIdRef = useRef<number | null>(null);
  const lastPayloadRef = useRef<RetainedPayload | null>(null);
  const archiveAttachMapRef = useRef<Map<number, (result: CoachResult) => void>>(new Map());

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || "{}");
      if (typeof saved.enabled === "boolean") setEnabledState(saved.enabled);
      if (saved.mode === "id-public-speaking" || saved.mode === "en-grammar") setModeState(saved.mode);
    } catch {
      // Corrupt prefs fall back to defaults.
    }
  }, []);

  const savePrefs = (next: { enabled: boolean; mode: CoachMode }) => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      // Private mode: prefs just won't persist.
    }
  };

  const setEnabled = useCallback(
    (val: boolean) => {
      setEnabledState(val);
      savePrefs({ enabled: val, mode });
    },
    [mode]
  );

  const setMode = useCallback(
    (next: CoachMode) => {
      setModeState(next);
      savePrefs({ enabled, mode: next });
    },
    [enabled]
  );

  const stopTick = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = null;
  }, []);

  const startTick = useCallback(() => {
    stopTick();
    tickRef.current = setInterval(() => {
      secRef.current += 1;
      setRecordedSec(secRef.current);
      if (secRef.current >= COACH_MAX_RECORD_SEC) {
        if (recorderRef.current?.state === "recording") {
          recorderRef.current.pause();
        }
        stopTick();
        setCapped(true);
        setStatus("paused");
      }
    }, 1000);
  }, [stopTick]);

  const releaseMic = useCallback(() => {
    stopTick();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
  }, [stopTick]);

  useEffect(() => releaseMic, [releaseMic]);

  const start = useCallback(async (): Promise<boolean> => {
    const rec = recorderRef.current;
    if (rec && rec.state === "paused") {
      if (secRef.current >= COACH_MAX_RECORD_SEC) return true;
      rec.resume();
      startTick();
      setStatus("recording");
      return true;
    }
    if (rec) return true;
    if (preparingRef.current) return false;

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      lastPayloadRef.current = null;
      setCanRetry(false);
      setError("Browser ini tidak mendukung perekaman suara. Coba Chrome, Edge, atau Safari terbaru.");
      setStatus("error");
      return false;
    }

    preparingRef.current = true;
    prepTokenRef.current += 1;
    const myPrepToken = prepTokenRef.current;
    uiRunIdRef.current += 1;
    lastPayloadRef.current = null;
    setCanRetry(false);
    setError(null);
    setResult(null);
    setStatus("preparing");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });

      // Discard/reset may have run while browser permission prompt was open.
      if (prepTokenRef.current !== myPrepToken) {
        stream.getTracks().forEach((t) => t.stop());
        preparingRef.current = false;
        return false;
      }

      const mimeType = pickMimeType();
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        audioBitsPerSecond: COACH_AUDIO_BITRATE,
      });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      streamRef.current = stream;
      recorderRef.current = recorder;
      secRef.current = 0;
      setRecordedSec(0);
      setCapped(false);
      recorder.start(1000);
      startTick();
      preparingRef.current = false;
      setStatus("recording");
      return true;
    } catch (err) {
      preparingRef.current = false;
      if (prepTokenRef.current !== myPrepToken) {
        return false;
      }
      releaseMic();
      setError(micErrorMessage(err));
      setStatus("error");
      return false;
    }
  }, [releaseMic, startTick]);

  const pause = useCallback(() => {
    const rec = recorderRef.current;
    if (rec?.state === "recording") {
      rec.pause();
      stopTick();
      setStatus("paused");
    }
  }, [stopTick]);

  const discard = useCallback(() => {
    prepTokenRef.current += 1;
    preparingRef.current = false;
    uiRunIdRef.current += 1;
    lastPayloadRef.current = null;
    setCanRetry(false);

    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.ondataavailable = null;
      rec.stop();
    }
    releaseMic();
    chunksRef.current = [];
    secRef.current = 0;
    setRecordedSec(0);
    setCapped(false);
    setError(null);
    setStatus("idle");
  }, [releaseMic]);

  const uploadPayload = useCallback(
    async (payload: RetainedPayload, runId: number): Promise<CoachResult | null> => {
      if (payload.blob.size > COACH_MAX_UPLOAD_BYTES) {
        if (lastPayloadRef.current === payload) lastPayloadRef.current = null;
        if (uiRunIdRef.current === runId) {
          setCanRetry(false);
          setError("Ukuran rekaman melebihi batas unggah 12 MB.");
          setStatus("error");
        }
        return null;
      }

      const existingAttach = payload.onAttach ?? archiveAttachMapRef.current.get(runId);
      if (existingAttach) {
        payload.onAttach = existingAttach;
        archiveAttachMapRef.current.set(runId, existingAttach);
      }

      lastPayloadRef.current = payload;
      setCanRetry(false);
      setStatus("analyzing");
      setError(null);

      const body = new FormData();
      body.append("audio", payload.blob, "latihan");
      body.append("mode", mode);
      body.append("topic", payload.meta.topic);
      body.append("constraint", payload.meta.constraint ?? "");
      body.append("recordedSec", String(payload.recordedSec));
      if (payload.meta.cues && payload.meta.cues.length > 0) {
        body.append("cues", JSON.stringify(payload.meta.cues));
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CLIENT_UPLOAD_TIMEOUT_MS);

      try {
        const res = await fetch("/api/coach", {
          method: "POST",
          body,
          signal: controller.signal,
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.result) {
          throw new Error(json.error || "Analisis gagal. Periksa koneksi, lalu coba lagi.");
        }

        const coachResult = json.result as CoachResult;
        const attach = archiveAttachMapRef.current.get(runId);
        if (attach) {
          archiveAttachMapRef.current.delete(runId);
          attach(coachResult);
        }

        if (lastPayloadRef.current === payload) {
          lastPayloadRef.current = null;
        }

        // Suppress stale UI update and modal if user already switched to another topic/session.
        if (uiRunIdRef.current !== runId) {
          return null;
        }

        setCanRetry(false);
        setResult(coachResult);
        setStatus("done");
        return coachResult;
      } catch (err) {
        if (uiRunIdRef.current !== runId) {
          return null;
        }

        const isAbort = (err as { name?: string })?.name === "AbortError";
        const message = isAbort
          ? "Permintaan analisis terlalu lama dan dihentikan. Kamu bisa mencoba analisis ulang."
          : err instanceof TypeError
            ? "Tidak bisa menghubungi server. Periksa koneksi internet kamu."
            : (err as Error).message;

        setError(message);
        setCanRetry(lastPayloadRef.current === payload);
        setStatus("error");
        return null;
      } finally {
        clearTimeout(timeoutId);
      }
    },
    [mode]
  );

  const finish = useCallback(
    async (meta: CoachSessionMeta): Promise<CoachResult | null> => {
      const rec = recorderRef.current;
      if (!rec) return null;

      // Allocate runId synchronously before yielding to rec.onstop so archive binding is race-free.
      analysisSeqRef.current += 1;
      const runId = analysisSeqRef.current;
      latestAnalysisRunIdRef.current = runId;
      uiRunIdRef.current = runId;

      const blob = await new Promise<Blob>((resolve) => {
        rec.onstop = () => resolve(new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" }));
        if (rec.state === "inactive") {
          rec.onstop?.(new Event("stop"));
        } else {
          rec.stop();
        }
      });
      const seconds = secRef.current;
      releaseMic();
      chunksRef.current = [];

      if (uiRunIdRef.current !== runId) {
        return null;
      }

      if (seconds < COACH_MIN_RECORD_SEC) {
        lastPayloadRef.current = null;
        setCanRetry(false);
        setError(`Rekaman baru ${seconds} detik. AI Coach butuh minimal ${COACH_MIN_RECORD_SEC} detik bicara.`);
        setStatus("error");
        return null;
      }

      const payload: RetainedPayload = { blob, recordedSec: seconds, meta };
      return uploadPayload(payload, runId);
    },
    [releaseMic, uploadPayload]
  );

  const retry = useCallback(async (): Promise<CoachResult | null> => {
    const retained = lastPayloadRef.current;
    if (!retained) return null;

    analysisSeqRef.current += 1;
    const runId = analysisSeqRef.current;
    latestAnalysisRunIdRef.current = runId;
    uiRunIdRef.current = runId;
    return uploadPayload(retained, runId);
  }, [uploadPayload]);

  const bindArchiveSession = useCallback((onAttach: (result: CoachResult) => void) => {
    const runId = latestAnalysisRunIdRef.current;
    if (runId !== null) {
      archiveAttachMapRef.current.set(runId, onAttach);
    }
    if (lastPayloadRef.current) {
      lastPayloadRef.current.onAttach = onAttach;
    }
  }, []);

  const clearResult = useCallback(() => {
    uiRunIdRef.current += 1;
    lastPayloadRef.current = null;
    setCanRetry(false);
    setResult(null);
    setError(null);
    setStatus("idle");
  }, []);

  return {
    enabled,
    setEnabled,
    mode,
    setMode,
    status,
    recordedSec,
    capped,
    error,
    result,
    hasRecording: status === "recording" || status === "paused",
    canRetry,
    start,
    pause,
    discard,
    finish,
    retry,
    bindArchiveSession,
    clearResult,
  };
}
