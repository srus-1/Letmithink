"use client";

import React from "react";
import { TopicQueueCard } from "./TopicQueueCard";
import { StatsCard } from "./StatsCard";
import { ConstraintCard } from "./ConstraintCard";
import { SessionRecord, SessionStats } from "@/lib/types";

export interface BentoGridProps {
  activeTitles: string[];
  archivedTitles: string[];
  constraints: string[];
  activeConstraint: string | null;
  useConstraintReel: boolean;
  onToggleReel: () => void;
  onShuffleConstraint: () => void;
  onAddSingleTitle: (title: string) => boolean;
  onAddBulkTitles: (raw: string) => number;
  onArchiveTitle: (title: string) => void;
  onDeleteTitle: (title: string) => void;
  onRestoreAllArchived: () => void;
  onRestoreSingleArchived: (title: string) => void;
  onAddConstraint: (rule: string) => boolean;
  onDeleteConstraint: (idx: number) => boolean;
  sessions: SessionRecord[];
  stats: SessionStats;
  onClearSessions: () => void;
  onOpenBulkModal: () => void;
  onOpenConstraintModal: () => void;
  onOpenArchiveDrawer: () => void;
  onNotify: (msg: string) => void;
}

export function BentoGrid({
  activeTitles,
  archivedTitles,
  constraints,
  activeConstraint,
  useConstraintReel,
  onToggleReel,
  onShuffleConstraint,
  onAddSingleTitle,
  onAddBulkTitles,
  onArchiveTitle,
  onDeleteTitle,
  onRestoreAllArchived,
  onRestoreSingleArchived,
  onAddConstraint,
  onDeleteConstraint,
  sessions,
  stats,
  onClearSessions,
  onOpenBulkModal,
  onOpenConstraintModal,
  onOpenArchiveDrawer,
  onNotify,
}: BentoGridProps) {
  return (
    <section
      id="kelola-topik"
      className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-14"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
        <div className="lg:col-span-5 flex">
          <TopicQueueCard
            activeTitles={activeTitles}
            archivedTitles={archivedTitles}
            onAddSingle={onAddSingleTitle}
            onAddBulk={onAddBulkTitles}
            onArchiveTitle={onArchiveTitle}
            onDeleteTitle={onDeleteTitle}
            onRestoreAllArchived={onRestoreAllArchived}
            onRestoreSingleArchived={onRestoreSingleArchived}
            onOpenBulkModal={onOpenBulkModal}
            onOpenArchiveDrawer={onOpenArchiveDrawer}
            onNotify={onNotify}
          />
        </div>

        <div className="lg:col-span-4 flex">
          <ConstraintCard
            constraints={constraints}
            activeConstraint={activeConstraint}
            useConstraintReel={useConstraintReel}
            onToggleReel={onToggleReel}
            onShuffleConstraint={onShuffleConstraint}
            onAddConstraint={onAddConstraint}
            onDeleteConstraint={onDeleteConstraint}
            onOpenModal={onOpenConstraintModal}
            onNotify={onNotify}
          />
        </div>

        <div className="lg:col-span-3 flex">
          <StatsCard
            sessions={sessions}
            stats={stats}
            onClearSessions={onClearSessions}
            onNotify={onNotify}
          />
        </div>
      </div>
    </section>
  );
}
