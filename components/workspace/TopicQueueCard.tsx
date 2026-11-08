"use client";

import React, { useState } from "react";
import { Plus, ListPlus, ChevronDown, ChevronUp } from "lucide-react";

export interface TopicQueueCardProps {
  activeTitles: string[];
  archivedTitles: string[];
  onAddSingle: (title: string) => boolean;
  onAddBulk: (raw: string) => number;
  onArchiveTitle: (title: string) => void;
  onDeleteTitle: (title: string) => void;
  onRestoreAllArchived: () => void;
  onRestoreSingleArchived: (title: string) => void;
  onOpenBulkModal: () => void;
  onOpenArchiveDrawer: () => void;
  onNotify: (msg: string) => void;
}

export function TopicQueueCard({
  activeTitles,
  archivedTitles,
  onAddSingle,
  onAddBulk,
  onArchiveTitle,
  onDeleteTitle,
  onRestoreAllArchived,
  onOpenBulkModal,
  onOpenArchiveDrawer,
  onNotify,
}: TopicQueueCardProps) {
  const [singleInput, setSingleInput] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [showBulkInline, setShowBulkInline] = useState(false);

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = singleInput.trim();
    if (!clean) return;
    if (activeTitles.includes(clean)) {
      onNotify("Judul tersebut sudah ada di dalam antrean aktif.");
      return;
    }
    const ok = onAddSingle(clean);
    if (ok) {
      setSingleInput("");
      onNotify("Judul berhasil ditambahkan ke antrean.");
    }
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = bulkInput.trim();
    if (!clean) {
      onNotify("Tulis minimal satu judul presentasi terlebih dahulu.");
      return;
    }
    const added = onAddBulk(clean);
    setBulkInput("");
    setShowBulkInline(false);
    onNotify(`${added} judul baru ditambahkan ke antrean.`);
  };

  const handleRestoreAll = () => {
    if (archivedTitles.length === 0) return;
    onRestoreAllArchived();
    onNotify("Semua judul dari arsip berhasil dikembalikan ke antrean aktif.");
  };

  return (
    <div
      id="daftar-judul"
      className="w-full rounded-2xl p-5 sm:p-6 bg-[#0D1117] text-white border border-slate-800 shadow-xs flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-white leading-tight">
              Kelola Daftar Topik
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-white/10 text-white text-xs font-semibold tabular-nums">
              {activeTitles.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-testid="open-bulk-modal-btn"
              aria-label="Buka Dialog Impor Massal"
              onClick={onOpenBulkModal}
              className="min-h-[44px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ListPlus className="w-3.5 h-3.5 text-white/80" aria-hidden="true" />
              <span>Impor</span>
            </button>
            <button
              type="button"
              aria-label="Buka Teks Impor Cepat"
              onClick={() => setShowBulkInline((prev) => !prev)}
              className="min-h-[44px] px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Teks</span>
              {showBulkInline ? (
                <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSingleSubmit} className="mb-4">
          <label htmlFor="single-title-input" className="sr-only">
            Judul presentasi baru
          </label>
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-lg border border-white/15 focus-within:border-[#C6FF33] transition-colors">
            <input
              type="text"
              data-testid="add-title-input"
              id="single-title-input"
              aria-label="Judul presentasi baru"
              placeholder="Tambah satu judul topik..."
              value={singleInput}
              onChange={(e) => setSingleInput(e.target.value)}
              className="w-full bg-transparent px-2.5 py-1 text-xs sm:text-sm text-white placeholder:text-white/50 focus:outline-none min-h-[38px]"
            />
            <button
              type="submit"
              data-testid="add-title-btn"
              id="single-title-submit"
              aria-label="Tambah judul"
              className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-md bg-[#C6FF33] hover:bg-[#B5F01E] text-[#0D1117] font-semibold flex items-center justify-center transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </form>

        {showBulkInline && (
          <form onSubmit={handleBulkSubmit} className="mb-4 bg-white/5 p-3 rounded-lg border border-white/15">
            <label
              htmlFor="bulk-title-textarea"
              className="block text-xs font-medium text-white/80 mb-1.5"
            >
              Tempel daftar judul (satu per baris):
            </label>
            <textarea
              data-testid="bulk-titles-textarea"
              id="bulk-title-textarea"
              rows={3}
              placeholder="Judul presentasi 1&#10;Judul presentasi 2&#10;Judul presentasi 3"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              className="w-full bg-white text-[#0D1117] rounded-md p-2 text-xs focus:outline-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                data-testid="save-bulk-btn"
                id="bulk-title-submit"
                className="min-h-[44px] px-3.5 py-1.5 rounded-md bg-[#C6FF33] hover:bg-[#B5F01E] text-[#0D1117] text-xs font-semibold cursor-pointer"
              >
                Tambahkan Semua Baris
              </button>
            </div>
          </form>
        )}

        <div>
          <div className="text-[11px] font-medium text-white/60 mb-3 pb-2 border-b border-white/10 bg-[#0D1117]">
            Daftar Antrean Aktif
          </div>

          {activeTitles.length === 0 ? (
            <div className="py-6 text-center text-white/60 text-xs">
              Belum ada topik aktif dalam antrean. Tambahkan topik baru di atas atau pulihkan dari arsip.
            </div>
          ) : (
            <ul className="divide-y divide-white/10 max-h-[320px] overflow-y-auto pt-2 pb-4 px-1">
              {activeTitles.map((title, idx) => (
                <li
                  key={`${idx}-${title}`}
                  data-testid={`active-topic-item-${idx}`}
                  className="group flex items-start justify-between gap-3 py-2 px-2 rounded-md hover:bg-white/5 transition-colors text-xs sm:text-sm"
                >
                  <span className="line-clamp-2 leading-snug text-white/95 font-normal pt-1">
                    <span className="font-medium text-white/50 tabular-nums mr-1.5">
                      {idx + 1}.
                    </span>
                    {title}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      data-testid="archive-active-btn"
                      id={`archive-topic-btn-${idx}`}
                      aria-label={`Arsipkan topik ${title}`}
                      onClick={() => onArchiveTitle(title)}
                      className="min-h-[44px] px-2.5 py-1 text-xs font-medium text-white/75 hover:text-white hover:bg-white/10 rounded-md transition-opacity opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer flex items-center justify-center"
                      title="Pindahkan ke Arsip"
                    >
                      Arsipkan
                    </button>

                    <button
                      type="button"
                      data-testid="delete-active-btn"
                      id={`delete-topic-btn-${idx}`}
                      aria-label={`Hapus topik ${title}`}
                      onClick={() => onDeleteTitle(title)}
                      className="min-h-[44px] min-w-[44px] px-2 text-base leading-none text-white/55 hover:text-white hover:bg-white/10 rounded-md transition-colors cursor-pointer flex items-center justify-center"
                      title="Hapus Topik Permanen"
                    >
                      &times;
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div
        id="arsip-selesai"
        className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-white/70"
      >
        <div className="flex items-center gap-1.5">
          <span
            data-testid="archived-count-badge"
            className="font-semibold text-white tabular-nums"
          >
            {archivedTitles.length}
          </span>
          <span>diarsipkan</span>
          <span aria-hidden="true">&middot;</span>
          <button
            type="button"
            data-testid="restore-all-btn"
            id="restore-all-archived-btn"
            aria-label="Kembalikan Semua Judul ke Antrean"
            disabled={archivedTitles.length === 0}
            onClick={handleRestoreAll}
            className="min-h-[44px] px-1.5 font-medium text-white hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
          >
            Kembalikan semua
          </button>
        </div>

        <button
          type="button"
          data-testid="open-archive-drawer-btn"
          aria-label="Buka Laci Arsip Lengkap"
          onClick={onOpenArchiveDrawer}
          className="min-h-[44px] px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          Lihat arsip
        </button>
      </div>
    </div>
  );
}
