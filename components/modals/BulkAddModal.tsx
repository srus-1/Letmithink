"use client";

import React, { useState, useEffect } from "react";
import { X, ListPlus, Check } from "lucide-react";

export interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBulk: (raw: string) => number;
  onNotify: (msg: string) => void;
}

export function BulkAddModal({
  isOpen,
  onClose,
  onAddBulk,
  onNotify,
}: BulkAddModalProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = text.trim();
    if (!clean) {
      onNotify("Tulis minimal satu judul presentasi terlebih dahulu.");
      return;
    }
    const added = onAddBulk(clean);
    setText("");
    onClose();
    onNotify(`${added} judul baru berhasil ditambahkan.`);
  };

  return (
    <div
      data-testid="bulk-add-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="bulk-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-canvas rounded-xl shadow-lg border border-hairline p-6 relative"
      >
        <button
          type="button"
          data-testid="close-bulk-modal-btn"
          aria-label="Tutup Dialog"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] absolute top-4 right-4 text-ink-slate hover:text-ink flex items-center justify-center rounded-lg hover:bg-surface transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-9 h-9 rounded-lg bg-ink text-accent-lime flex items-center justify-center">
            <ListPlus className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 id="bulk-modal-title" className="text-base sm:text-lg font-semibold text-ink">
              Impor Banyak Topik Sekaligus
            </h3>
            <p className="text-xs font-normal text-ink-slate">
              Tempel daftar judul presentasi, satu baris untuk setiap topik.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="modal-bulk-titles-textarea"
              className="block text-xs font-medium text-ink-slate mb-1.5"
            >
              Daftar judul, satu topik per baris:
            </label>
            <textarea
              id="modal-bulk-titles-textarea"
              data-testid="bulk-titles-textarea"
              rows={8}
              placeholder="Strategi Efisiensi Operasional Cloud&#10;Teknik Bercerita untuk Presentasi Teknis&#10;Cara Menentukan Prioritas Fitur dengan Data"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full rounded-xl border border-hairline bg-surface p-3 text-xs sm:text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ink"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 rounded-lg text-xs font-medium text-ink-slate hover:text-ink hover:bg-surface transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              data-testid="save-bulk-btn"
              className="min-h-[44px] px-5 py-2 rounded-lg bg-accent-lime hover:bg-accent-lime-hover text-ink text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-ink/20"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>Simpan Semua Baris</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
