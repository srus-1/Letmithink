"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { StageContainer } from "@/components/stage/StageContainer";
import { BentoGrid } from "@/components/workspace/BentoGrid";
import { BulkAddModal } from "@/components/modals/BulkAddModal";
import { ConstraintModal } from "@/components/modals/ConstraintModal";
import { ArchiveDrawer } from "@/components/modals/ArchiveDrawer";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { CoachResultModal } from "@/components/modals/CoachResultModal";
import { Toast } from "@/components/ui/Toast";

import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useSpinnerReel } from "@/hooks/useSpinnerReel";
import { usePresentationTimer } from "@/hooks/usePresentationTimer";
import { useTopicStorage } from "@/hooks/useTopicStorage";
import { useCueNotes } from "@/hooks/useCueNotes";
import { useSpeechCoach } from "@/hooks/useSpeechCoach";
import { useCoachChat } from "@/hooks/useCoachChat";
import type { CoachResult } from "@/lib/types";

export default function Home() {
  const storage = useTopicStorage();
  const audio = useAudioEngine(storage.soundEnabled);

  // Storage is the single source of truth for the sound setting; toggling writes
  // straight to storage (and thus localStorage), and the audio hook follows it.
  const toggleSound = useCallback(() => {
    storage.setSoundEnabled(!storage.soundEnabled);
  }, [storage.setSoundEnabled, storage.soundEnabled]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isConstraintOpen, setIsConstraintOpen] = useState(false);
  const [isArchiveDrawerOpen, setIsArchiveDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeCoachModalResult, setActiveCoachModalResult] = useState<CoachResult | null>(null);
  const [micStartFailed, setMicStartFailed] = useState(false);
  const micPrepLockRef = useRef(false);
  const micPrepAbortedRef = useRef(false);

  const notify = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  }, []);

  const reel = useSpinnerReel(storage.activeTitles);
  const cues = useCueNotes();
  const coach = useSpeechCoach();

  const currentTopic =
    reel.selectedTitle || (storage.activeTitles.length > 0 ? storage.activeTitles[0] : "");

  const coachChat = useCoachChat({
    mode: coach.mode,
    topic: currentTopic,
    constraint: reel.selectedConstraint,
    cues: cues.notes,
    result: coach.result,
  });
  const clearCoachChat = coachChat.clearChat;

  const handleTimeUp = useCallback(() => {
    audio.playAlarmRing();
    notify("Waktu habis! Durasi bicara telah selesai.");
    if (coach.enabled && coach.hasRecording) {
      const filledCues = cues.notes.map((n) => n.trim()).filter(Boolean);
      void coach
        .finish({
          topic: currentTopic,
          constraint: reel.selectedConstraint,
          cues: filledCues,
        })
        .then((res) => {
          if (res) setActiveCoachModalResult(res);
        });
    }
  }, [audio, notify, coach, cues.notes, currentTopic, reel.selectedConstraint]);

  const timer = usePresentationTimer(undefined, handleTimeUp);

  const handleSpin = useCallback(() => {
    if (reel.isSpinning) return;

    if (reel.isLocked && reel.selectedTitle) {
      notify("Judul sedang dikunci. Buka kunci jika ingin mengacak ulang.");
      return;
    }

    if (storage.activeTitles.length === 0) {
      notify("Daftar judul kosong. Tambahkan judul di bawah atau pulihkan arsip.");
      return;
    }

    // Web Audio API requires resuming AudioContext directly inside a user gesture handler
    audio.initAudio();

    micPrepAbortedRef.current = true;
    setMicStartFailed(false);
    timer.setStageMode("SPIN");
    timer.resetTimer();
    coach.discard();
    coach.clearResult();
    clearCoachChat();

    const started = reel.spin(
      storage.activeTitles,
      storage.constraints,
      storage.useConstraintReel,
      (velocityRatio) => {
        audio.playDetentClick(velocityRatio);
      },
      (winnerTitle) => {
        audio.playLockChime();
        notify(`Topik terpilih: ${winnerTitle}`);
      }
    );

    if (!started) {
      notify("Gagal memulai putaran drum.");
    }
  }, [reel, storage, audio, timer, coach, clearCoachChat, notify]);

  const handleToggleTimer = useCallback(async () => {
    audio.initAudio();

    if (!reel.selectedTitle && storage.activeTitles.length > 0) {
      reel.setSelectedTitle(storage.activeTitles[0]);
    }

    if (timer.timerRunning) {
      coach.pause();
      timer.pause();
      return;
    }

    if (coach.enabled) {
      if (coach.status === "preparing" || micPrepLockRef.current) {
        return;
      }
      micPrepLockRef.current = true;
      micPrepAbortedRef.current = false;
      setMicStartFailed(false);
      try {
        const started = await coach.start();
        if (!started) {
          if (!micPrepAbortedRef.current) {
            setMicStartFailed(true);
          }
          return;
        }
      } finally {
        micPrepLockRef.current = false;
        micPrepAbortedRef.current = false;
      }
    } else {
      setMicStartFailed(false);
    }

    timer.start();
  }, [audio, reel, storage.activeTitles, timer, coach]);

  const handleContinueWithoutAi = useCallback(() => {
    setMicStartFailed(false);
    coach.setEnabled(false);
    coach.clearResult();
    timer.start();
    notify("AI Coach dimatikan. Timer latihan berjalan.");
  }, [coach, timer, notify]);

  const handleRetryCoach = useCallback(() => {
    void coach.retry().then((res) => {
      if (res) setActiveCoachModalResult(res);
    });
  }, [coach]);

  const handleCompleteAndArchive = useCallback(() => {
    const topicToSave = reel.selectedTitle || (storage.activeTitles.length > 0 ? storage.activeTitles[0] : null);
    if (!topicToSave) {
      notify("Tidak ada topik aktif untuk diarsipkan.");
      return;
    }

    const filledCues = cues.notes.map((n) => n.trim()).filter(Boolean);
    timer.pause();
    const constraintUsed = reel.selectedConstraint;

    const saved = storage.completeSession({
      title: topicToSave,
      constraint: constraintUsed,
      targetSec: timer.targetSec,
      spokenSec: timer.elapsedSec,
      overtimeSec: Math.max(0, timer.elapsedSec - timer.targetSec),
      ...(coach.result ? { coach: coach.result } : {}),
    });

    if (coach.enabled && coach.hasRecording) {
      void coach
        .finish({ topic: topicToSave, constraint: constraintUsed, cues: filledCues })
        .then((res) => {
          if (res) {
            setActiveCoachModalResult(res);
          }
        });
      coach.bindArchiveSession((res) => storage.attachCoachResult(saved.id, res));
    } else if (coach.status === "analyzing" || coach.canRetry) {
      coach.bindArchiveSession((res) => storage.attachCoachResult(saved.id, res));
    } else if (coach.result) {
      setActiveCoachModalResult(coach.result);
    }

    setMicStartFailed(false);
    reel.resetSelection();
    timer.resetTimer();
    cues.clearNotes();
    timer.setStageMode("SPIN");

    notify("Sesi disimpan dan judul dipindahkan ke arsip selesai.");
  }, [reel, storage, timer, cues, coach, notify]);

  const handleResetTimer = useCallback(() => {
    micPrepAbortedRef.current = true;
    setMicStartFailed(false);
    timer.resetTimer();
    coach.discard();
    reel.setIsLocked(false);
    notify("Waktu latihan dan status panggung telah direset.");
  }, [timer, coach, reel, notify]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore global shortcuts while typing inside form fields
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        void handleToggleTimer();
      } else if (e.code === "KeyR" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleResetTimer();
      } else if (e.code === "KeyP" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleSpin();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleToggleTimer, handleResetTimer, handleSpin]);

  return (
    <main className="min-h-screen bg-canvas text-ink font-sans">
      <Header
        activeCount={storage.activeTitles.length}
        stageMode={timer.stageMode}
        onSelectStageMode={timer.setStageMode}
        soundEnabled={audio.soundEnabled}
        onToggleSound={toggleSound}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <StageContainer
        stageMode={timer.stageMode}
        onSetStageMode={timer.setStageMode}
        isSpinning={reel.isSpinning}
        reelSequence={reel.reelSequence}
        reelOffset={reel.reelOffset}
        activeSlotIndex={reel.activeSlotIndex}
        activeTitles={storage.activeTitles}
        isLocked={reel.isLocked}
        onToggleLock={reel.toggleLock}
        selectedTitle={reel.selectedTitle}
        selectedConstraint={reel.selectedConstraint}
        onSpin={handleSpin}
        elapsedSec={timer.elapsedSec}
        remainingSec={timer.remainingSec}
        stageSignal={timer.stageSignal}
        timerRunning={timer.timerRunning}
        onToggleTimer={handleToggleTimer}
        onResetTimer={handleResetTimer}
        onCompleteAndArchive={handleCompleteAndArchive}
        targetSec={timer.targetSec}
        onSelectDurationPreset={timer.setDuration}
        customMinutes={timer.customMinutes}
        onCustomMinutesChange={timer.setCustomMinutes}
        onApplyCustomMinutes={() => {
          const ok = timer.applyCustomMinutes();
          if (ok) {
            notify(`Durasi disesuaikan menjadi ${timer.customMinutes} menit.`);
          } else {
            notify("Masukkan durasi antara 1 hingga 120 menit.");
          }
        }}
        notes={cues.notes}
        onNoteChange={cues.setNote}
        getWordCount={cues.getWordCount}
        curveballEnabled={timer.curveballEnabled}
        onToggleCurveball={timer.toggleCurveball}
        activeCurveball={timer.activeCurveball}
        onDismissCurveball={timer.dismissCurveball}
        coachProps={{
          enabled: coach.enabled,
          onToggle: () => {
            setMicStartFailed(false);
            coach.setEnabled(!coach.enabled);
          },
          mode: coach.mode,
          onSelectMode: coach.setMode,
          status: coach.status,
          recordedSec: coach.recordedSec,
          capped: coach.capped,
          error: coach.error,
          hasResult: Boolean(coach.result),
          canRetry: coach.canRetry,
          onRetry: handleRetryCoach,
          onContinueWithoutAi: micStartFailed ? handleContinueWithoutAi : undefined,
          onOpenResult: () => {
            if (coach.result) setActiveCoachModalResult(coach.result);
          },
          onDismissError: () => {
            setMicStartFailed(false);
            coach.clearResult();
          },
          topic: currentTopic,
          constraint: reel.selectedConstraint,
          cues: cues.notes,
          result: coach.result,
          chatMessages: coachChat.messages,
          chatSending: coachChat.sending,
          chatError: coachChat.chatError,
          onSendChat: coachChat.sendMessage,
          onRetryChat: coachChat.retryLastMessage,
          onClearChat: clearCoachChat,
          onDismissChatError: coachChat.dismissChatError,
        }}
      />

      <BentoGrid
        activeTitles={storage.activeTitles}
        archivedTitles={storage.archivedTitles}
        constraints={storage.constraints}
        activeConstraint={reel.selectedConstraint}
        useConstraintReel={storage.useConstraintReel}
        onToggleReel={storage.toggleConstraintReel}
        onShuffleConstraint={() => {
          const next = storage.shuffleConstraint();
          if (next) {
            reel.setSelectedConstraint(next);
            notify(`Tantangan diganti: ${next}`);
          }
        }}
        onAddSingleTitle={storage.addTitle}
        onAddBulkTitles={storage.addBulk}
        onArchiveTitle={(t) => {
          storage.archiveTitle(t);
          notify(`Topik ${t} dipindahkan ke arsip.`);
        }}
        onDeleteTitle={(t) => {
          storage.deleteTitle(t);
          notify(`Topik ${t} dihapus dari antrean.`);
        }}
        onRestoreAllArchived={storage.restoreAll}
        onRestoreSingleArchived={storage.restoreTitle}
        onAddConstraint={storage.addConstraint}
        onDeleteConstraint={storage.deleteConstraint}
        sessions={storage.sessions}
        stats={storage.stats}
        onClearSessions={storage.clearSessions}
        onOpenBulkModal={() => setIsBulkOpen(true)}
        onOpenConstraintModal={() => setIsConstraintOpen(true)}
        onOpenArchiveDrawer={() => setIsArchiveDrawerOpen(true)}
        onNotify={notify}
        onOpenCoachResult={(res) => setActiveCoachModalResult(res)}
      />

      <Footer />

      <BulkAddModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onAddBulk={storage.addBulk}
        onNotify={notify}
      />

      <ConstraintModal
        isOpen={isConstraintOpen}
        onClose={() => setIsConstraintOpen(false)}
        constraints={storage.constraints}
        onAddConstraint={storage.addConstraint}
        onDeleteConstraint={storage.deleteConstraint}
        onNotify={notify}
      />

      <ArchiveDrawer
        isOpen={isArchiveDrawerOpen}
        onClose={() => setIsArchiveDrawerOpen(false)}
        archivedTitles={storage.archivedTitles}
        onRestoreAll={storage.restoreAll}
        onRestoreSingle={storage.restoreTitle}
        onNotify={notify}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        soundEnabled={audio.soundEnabled}
        onToggleSound={toggleSound}
        curveballEnabled={timer.curveballEnabled}
        onToggleCurveball={timer.toggleCurveball}
        useConstraintReel={storage.useConstraintReel}
        onToggleConstraintReel={storage.toggleConstraintReel}
        coachEnabled={coach.enabled}
        onToggleCoach={() => coach.setEnabled(!coach.enabled)}
        onResetToDefaults={() => {
          storage.resetToDefaults();
          reel.resetSelection();
          timer.resetTimer();
          cues.clearNotes();
          coach.discard();
          coach.clearResult();
          clearCoachChat();
        }}
        onNotify={notify}
      />

      <CoachResultModal
        result={activeCoachModalResult}
        onClose={() => setActiveCoachModalResult(null)}
        onNotify={notify}
      />

      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </main>
  );
}
