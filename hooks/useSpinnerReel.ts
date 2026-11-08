"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ITEM_HEIGHT, SPIN_DURATION_MS, TOTAL_SPIN_ITEMS } from "@/lib/constants";

export interface SpinnerReelReturn {
  isSpinning: boolean;
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
  selectedTitle: string | null;
  setSelectedTitle: (title: string | null) => void;
  selectedConstraint: string | null;
  setSelectedConstraint: (constraint: string | null) => void;
  reelSequence: string[];
  setReelSequence: (seq: string[]) => void;
  reelOffset: number;
  setReelOffset: (offset: number) => void;
  activeSlotIndex: number;
  spin: (
    activeTitles: string[],
    constraints: string[],
    useConstraintReel: boolean,
    onTick?: (velocityRatio: number) => void,
    onComplete?: (winnerTitle: string, winnerConstraint: string | null) => void
  ) => boolean;
  toggleLock: () => void;
  resetSelection: () => void;
}

export function useSpinnerReel(initialTitles: string[] = []): SpinnerReelReturn {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedConstraint, setSelectedConstraint] = useState<string | null>(null);
  const [reelSequence, setReelSequence] = useState<string[]>([]);
  const [reelOffset, setReelOffset] = useState(0);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reelSequence.length === 0 && initialTitles.length > 0) {
      const preview = [
        initialTitles[0],
        initialTitles[1 % initialTitles.length],
        initialTitles[2 % initialTitles.length],
      ];
      setReelSequence(preview);
      setReelOffset(0);
      setActiveSlotIndex(0);
    }
  }, [initialTitles, reelSequence.length]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const toggleLock = useCallback(() => {
    setIsLocked((prev) => !prev);
  }, []);

  const resetSelection = useCallback(() => {
    setIsSpinning(false);
    setIsLocked(false);
    setSelectedTitle(null);
    setSelectedConstraint(null);
    setReelOffset(0);
    setActiveSlotIndex(0);
  }, []);

  const spin = useCallback(
    (
      activeTitles: string[],
      constraints: string[],
      useConstraintReel: boolean,
      onTick?: (velocityRatio: number) => void,
      onComplete?: (winnerTitle: string, winnerConstraint: string | null) => void
    ): boolean => {
      if (isSpinning) return false;
      if (isLocked && selectedTitle) return false;
      if (activeTitles.length === 0) return false;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      setIsSpinning(true);

      const winnerIndex = Math.floor(Math.random() * activeTitles.length);
      const winnerTitle = activeTitles[winnerIndex];
      const winnerConstraint =
        useConstraintReel && constraints.length > 0
          ? constraints[Math.floor(Math.random() * constraints.length)]
          : null;

      const sequence: string[] = [];
      const firstItem = selectedTitle || activeTitles[0];
      sequence.push(firstItem);

      for (let i = 1; i < TOTAL_SPIN_ITEMS - 2; i++) {
        let pick = activeTitles[Math.floor(Math.random() * activeTitles.length)];
        if (activeTitles.length > 1 && pick === sequence[i - 1]) {
          pick = activeTitles[(activeTitles.indexOf(pick) + 1) % activeTitles.length];
        }
        sequence.push(pick);
      }

      // Ensure the penultimate item differs from the winner so the final crawl across the detent line is visible.
      if (activeTitles.length > 1 && sequence[sequence.length - 1] === winnerTitle) {
        sequence[sequence.length - 1] = activeTitles[(winnerIndex + 1) % activeTitles.length];
      }

      const afterWinner = activeTitles[(winnerIndex + 1) % activeTitles.length];
      sequence.push(winnerTitle);
      sequence.push(afterWinner);

      const targetIndex = sequence.length - 2;
      const totalDistance = targetIndex * ITEM_HEIGHT;

      setReelSequence(sequence);
      setReelOffset(0);
      setActiveSlotIndex(0);

      let lastTickSlot = 0;
      const startTime = performance.now();

      const animateStep = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / SPIN_DURATION_MS);

        // Quintic ease-out: 1 - (1 - progress)^4.5
        const eased = 1 - Math.pow(1 - progress, 4.5);
        const currentOffset = Math.round(eased * totalDistance);

        setReelOffset(currentOffset);

        const currentSlot = Math.floor((currentOffset + ITEM_HEIGHT * 0.5) / ITEM_HEIGHT);
        if (currentSlot > lastTickSlot) {
          const instantaneousVelocity = Math.pow(1 - progress, 3.5);
          if (onTick) {
            onTick(instantaneousVelocity);
          }
          lastTickSlot = currentSlot;
          setActiveSlotIndex(currentSlot);
        }

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animateStep);
        } else {
          setReelOffset(totalDistance);
          setActiveSlotIndex(targetIndex);
          setIsSpinning(false);
          setSelectedTitle(winnerTitle);
          setSelectedConstraint(winnerConstraint);
          setIsLocked(false);
          if (onComplete) {
            onComplete(winnerTitle, winnerConstraint);
          }
        }
      };

      rafRef.current = requestAnimationFrame(animateStep);
      return true;
    },
    [isSpinning, isLocked, selectedTitle]
  );

  return {
    isSpinning,
    isLocked,
    setIsLocked,
    selectedTitle,
    setSelectedTitle,
    selectedConstraint,
    setSelectedConstraint,
    reelSequence,
    setReelSequence,
    reelOffset,
    setReelOffset,
    activeSlotIndex,
    spin,
    toggleLock,
    resetSelection,
  };
}
