"use client";

import { useState, useCallback } from "react";
import { CueNotes } from "@/lib/types";
import { capFiveWords, countWords } from "@/lib/formatters";

export interface CueNotesReturn {
  notes: CueNotes;
  setNote: (index: number, rawText: string) => void;
  clearNotes: () => void;
  getWordCount: (index: number) => number;
}

export function useCueNotes(initialNotes: CueNotes = ["", "", ""]): CueNotesReturn {
  const [notes, setNotes] = useState<CueNotes>(initialNotes);

  const setNote = useCallback((index: number, rawText: string) => {
    if (index < 0 || index > 2) return;
    const capped = capFiveWords(rawText);
    setNotes((prev) => {
      const next: CueNotes = [...prev];
      next[index] = capped;
      return next;
    });
  }, []);

  const clearNotes = useCallback(() => {
    setNotes(["", "", ""]);
  }, []);

  const getWordCount = useCallback(
    (index: number): number => {
      if (index < 0 || index > 2) return 0;
      return countWords(notes[index]);
    },
    [notes]
  );

  return {
    notes,
    setNote,
    clearNotes,
    getWordCount,
  };
}
