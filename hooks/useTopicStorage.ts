"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { SessionRecord, SessionStats, PutarTopikStoragePayload, CoachResult } from "@/lib/types";
import { STORAGE_KEY, DEFAULT_TITLES, DEFAULT_CONSTRAINTS } from "@/lib/constants";
import { COACH_HISTORY_MAX_DETAILS } from "@/lib/coach/limits";
import { formatIndonesianDate } from "@/lib/formatters";

/** Keeps full AI Coach payloads only on the newest sessions while preserving timing stats on older ones. */
export function pruneCoachHistory(
  list: SessionRecord[],
  maxDetails: number = COACH_HISTORY_MAX_DETAILS
): SessionRecord[] {
  let kept = 0;
  let changed = false;

  const next = list.map((record) => {
    if (!record.coach) return record;
    if (kept < maxDetails) {
      kept += 1;
      return record;
    }
    changed = true;
    const { coach: _omitted, ...rest } = record;
    void _omitted;
    return rest;
  });

  return changed ? next : list;
}

function persistStoragePayload(payload: PutarTopikStoragePayload): void {
  const write = (sessionsToSave: SessionRecord[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...payload, sessions: sessionsToSave }));
  };

  try {
    write(payload.sessions);
    return;
  } catch {
    // Progressively strip oldest .coach payloads when storage quota is exceeded
  }

  const coachCount = payload.sessions.filter((s) => Boolean(s.coach)).length;
  for (let limit = coachCount - 1; limit >= 0; limit -= 1) {
    try {
      write(pruneCoachHistory(payload.sessions, limit));
      return;
    } catch {
      // Continue trimming older coach details until payload fits or storage is unavailable
    }
  }
}

export interface TopicStorageReturn {
  hydrated: boolean;
  activeTitles: string[];
  setActiveTitles: React.Dispatch<React.SetStateAction<string[]>>;
  archivedTitles: string[];
  setArchivedTitles: React.Dispatch<React.SetStateAction<string[]>>;
  constraints: string[];
  setConstraints: React.Dispatch<React.SetStateAction<string[]>>;
  useConstraintReel: boolean;
  setUseConstraintReel: (val: boolean) => void;
  toggleConstraintReel: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  sessions: SessionRecord[];
  setSessions: React.Dispatch<React.SetStateAction<SessionRecord[]>>;
  stats: SessionStats;
  addTitle: (title: string) => boolean;
  addBulk: (rawOrLines: string | string[]) => number;
  archiveTitle: (title: string) => void;
  deleteTitle: (title: string) => void;
  restoreTitle: (title: string) => void;
  restoreAll: () => void;
  addConstraint: (rule: string) => boolean;
  deleteConstraint: (indexOrRule: number | string) => boolean;
  shuffleConstraint: () => string | null;
  completeSession: (record: Omit<SessionRecord, "id" | "timestamp">) => SessionRecord;
  clearSessions: () => void;
  attachCoachResult: (sessionId: string, coach: CoachResult) => void;
  resetToDefaults: () => void;
}

export function useTopicStorage(): TopicStorageReturn {
  const [hydrated, setHydrated] = useState(false);
  const [activeTitles, setActiveTitles] = useState<string[]>(DEFAULT_TITLES);
  const [archivedTitles, setArchivedTitles] = useState<string[]>([]);
  const [constraints, setConstraints] = useState<string[]>(DEFAULT_CONSTRAINTS);
  const [useConstraintReel, setUseConstraintReelState] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  // Hydrate state from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PutarTopikStoragePayload = JSON.parse(saved);
        if (Array.isArray(parsed.activeTitles)) {
          setActiveTitles(parsed.activeTitles);
        }
        if (Array.isArray(parsed.archivedTitles)) {
          setArchivedTitles(parsed.archivedTitles);
        }
        if (Array.isArray(parsed.constraints) && parsed.constraints.length > 0) {
          setConstraints(parsed.constraints);
        }
        if (typeof parsed.useConstraintReel === "boolean") {
          setUseConstraintReelState(parsed.useConstraintReel);
        }
        if (typeof parsed.soundEnabled === "boolean") {
          setSoundEnabledState(parsed.soundEnabled);
        }
        if (Array.isArray(parsed.sessions)) {
          setSessions(pruneCoachHistory(parsed.sessions));
        }
      }
    } catch {
      // Safe fallback to defaults if localStorage read fails
    } finally {
      setHydrated(true);
    }
  }, []);

  // Skip writing until client hydration completes so SSR defaults do not overwrite saved data
  useEffect(() => {
    if (!hydrated) return;
    persistStoragePayload({
      activeTitles,
      archivedTitles,
      constraints,
      useConstraintReel,
      soundEnabled,
      sessions,
    });
  }, [hydrated, activeTitles, archivedTitles, constraints, useConstraintReel, soundEnabled, sessions]);

  const stats = useMemo<SessionStats>(() => {
    if (sessions.length === 0) {
      return { onTimeRate: 0, avgSec: 0, totalSessions: 0 };
    }
    const validSessions = sessions.filter((s) => (s.spokenSec || 0) >= 15);
    const onTimeCount = validSessions.filter((s) => s.overtimeSec === 0).length;
    const totalSpoken = sessions.reduce((acc, s) => acc + (s.spokenSec || 0), 0);
    return {
      onTimeRate:
        validSessions.length > 0
          ? Math.round((onTimeCount / validSessions.length) * 100)
          : 0,
      avgSec: Math.round(totalSpoken / sessions.length),
      totalSessions: sessions.length,
    };
  }, [sessions]);

  const setUseConstraintReel = useCallback((val: boolean) => {
    setUseConstraintReelState(val);
  }, []);

  const toggleConstraintReel = useCallback(() => {
    setUseConstraintReelState((prev) => !prev);
  }, []);

  const setSoundEnabled = useCallback((val: boolean) => {
    setSoundEnabledState(val);
  }, []);

  const addTitle = useCallback(
    (title: string): boolean => {
      const clean = title.trim();
      if (!clean) return false;
      if (activeTitles.includes(clean)) return false;

      setActiveTitles((prev) => [clean, ...prev]);
      return true;
    },
    [activeTitles]
  );

  const addBulk = useCallback(
    (rawOrLines: string | string[]): number => {
      let lines: string[] = [];
      if (typeof rawOrLines === "string") {
        lines = rawOrLines
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
      } else if (Array.isArray(rawOrLines)) {
        lines = rawOrLines.map((l) => l.trim()).filter(Boolean);
      }

      if (lines.length === 0) return 0;

      let added = 0;
      setActiveTitles((prev) => {
        const nextList = [...prev];
        lines.forEach((line) => {
          if (!nextList.includes(line)) {
            nextList.push(line);
            added++;
          }
        });
        return nextList;
      });

      return added;
    },
    []
  );

  const archiveTitle = useCallback((titleToArchive: string) => {
    setActiveTitles((prev) => prev.filter((t) => t !== titleToArchive));
    setArchivedTitles((prev) =>
      prev.includes(titleToArchive) ? prev : [titleToArchive, ...prev]
    );
  }, []);

  const deleteTitle = useCallback((titleToDelete: string) => {
    setActiveTitles((prev) => prev.filter((t) => t !== titleToDelete));
  }, []);

  const restoreTitle = useCallback((titleToRestore: string) => {
    setArchivedTitles((prev) => prev.filter((t) => t !== titleToRestore));
    setActiveTitles((prev) =>
      prev.includes(titleToRestore) ? prev : [titleToRestore, ...prev]
    );
  }, []);

  const restoreAll = useCallback(() => {
    if (archivedTitles.length === 0) return;
    setActiveTitles((prev) => {
      const combined = [...prev];
      archivedTitles.forEach((t) => {
        if (!combined.includes(t)) {
          combined.push(t);
        }
      });
      return combined;
    });
    setArchivedTitles([]);
  }, [archivedTitles]);

  const addConstraint = useCallback(
    (rule: string): boolean => {
      const clean = rule.trim();
      if (!clean) return false;
      if (constraints.includes(clean)) return false;
      setConstraints((prev) => [...prev, clean]);
      return true;
    },
    [constraints]
  );

  const deleteConstraint = useCallback(
    (indexOrRule: number | string): boolean => {
      if (constraints.length <= 1) return false;

      if (typeof indexOrRule === "number") {
        setConstraints((prev) => prev.filter((_, idx) => idx !== indexOrRule));
        return true;
      }

      setConstraints((prev) => prev.filter((c) => c !== indexOrRule));
      return true;
    },
    [constraints.length]
  );

  const shuffleConstraint = useCallback((): string | null => {
    if (constraints.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * constraints.length);
    return constraints[randomIndex];
  }, [constraints]);

  const completeSession = useCallback(
    (record: Omit<SessionRecord, "id" | "timestamp">): SessionRecord => {
      const newRecord: SessionRecord = {
        id: `${Date.now()}`,
        title: record.title,
        constraint: record.constraint,
        targetSec: record.targetSec,
        spokenSec: record.spokenSec,
        overtimeSec: Math.max(0, record.spokenSec - record.targetSec),
        timestamp: formatIndonesianDate(),
        ...(record.coach ? { coach: record.coach } : {}),
      };

      setSessions((prev) => pruneCoachHistory([newRecord, ...prev]));

      // Move title from active to archived
      setActiveTitles((prev) => prev.filter((t) => t !== record.title));
      setArchivedTitles((prev) =>
        prev.includes(record.title) ? prev : [record.title, ...prev]
      );

      return newRecord;
    },
    []
  );

  const clearSessions = useCallback(() => {
    setSessions([]);
  }, []);

  // Analysis can finish after the session row was already saved.
  const attachCoachResult = useCallback((sessionId: string, coach: CoachResult) => {
    setSessions((prev) =>
      pruneCoachHistory(prev.map((s) => (s.id === sessionId ? { ...s, coach } : s)))
    );
  }, []);

  const resetToDefaults = useCallback(() => {
    setActiveTitles(DEFAULT_TITLES);
    setArchivedTitles([]);
    setConstraints(DEFAULT_CONSTRAINTS);
    setUseConstraintReelState(true);
    setSoundEnabledState(true);
    setSessions([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    hydrated,
    activeTitles,
    setActiveTitles,
    archivedTitles,
    setArchivedTitles,
    constraints,
    setConstraints,
    useConstraintReel,
    setUseConstraintReel,
    toggleConstraintReel,
    soundEnabled,
    setSoundEnabled,
    sessions,
    setSessions,
    stats,
    addTitle,
    addBulk,
    archiveTitle,
    deleteTitle,
    restoreTitle,
    restoreAll,
    addConstraint,
    deleteConstraint,
    shuffleConstraint,
    completeSession,
    clearSessions,
    attachCoachResult,
    resetToDefaults,
  };
}
