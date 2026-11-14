"use client";

import React, { useState, useEffect } from "react";
import { X, SlidersHorizontal, Plus, Trash2 } from "lucide-react";

export interface ConstraintModalProps {
  isOpen: boolean;
  onClose: () => void;
  constraints: string[];
  onAddConstraint: (rule: string) => boolean;
  onDeleteConstraint: (idx: number) => boolean;
  onNotify: (msg: string) => void;
}

export function ConstraintModal({
  isOpen,
  onClose,
  constraints,
  onAddConstraint,
  onDeleteConstraint,
  onNotify,
}: ConstraintModalProps) {
  const [newRule, setNewRule] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newRule.trim();
    if (!clean) return;
    const ok = onAddConstraint(clean);
    if (ok) {
      setNewRule("");
      onNotify("Aturan tantangan berhasil ditambahkan.");
    } else {
      onNotify("Aturan tantangan sudah ada di daftar.");
    }
  };

  const handleDelete = (idx: number) => {
    if (constraints.length <= 1) {
      onNotify("Minimal 1 aturan tantangan harus tetap ada di panggung.");
      return;
    }
    const ok = onDeleteConstraint(idx);
    if (ok) {
      onNotify("Aturan tantangan dihapus.");
    }
  };

  return (
    <div
      data-testid="constraint-modal"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="constraint-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-canvas rounded-xl shadow-lg border border-hairline p-6 relative flex flex-col max-h-[85vh]"
      >
        <button
          type="button"
          data-testid="close-constraint-modal-btn"
          aria-label="Tutup Dialog"
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] absolute top-4 right-4 text-ink-slate hover:text-ink flex items-center justify-center rounded-lg hover:bg-surface transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-2.5 mb-2 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-accent-lime text-ink border border-ink/20 flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 id="constraint-modal-title" className="text-base sm:text-lg font-semibold text-ink">
              Kelola Aturan Tantangan
            </h3>
            <p className="text-xs font-normal text-ink-slate">
              Variasi pembawaan untuk melatih struktur dan keluwesan bicara.
            </p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="mt-4 mb-4 shrink-0">
          <label htmlFor="modal-add-constraint-input" className="sr-only">
            Aturan tantangan baru
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              id="modal-add-constraint-input"
              data-testid="add-constraint-input"
              aria-label="Aturan tantangan baru"
              placeholder="Contoh: Buka dengan pertanyaan retoris..."
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-lg border border-hairline bg-surface text-ink text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ink"
            />
            <button
              type="submit"
              data-testid="save-constraint-btn"
              aria-label="Tambah Tantangan"
              className="min-h-[44px] px-4 rounded-lg bg-accent-lime hover:bg-accent-lime-hover text-ink text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 border border-ink/20"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Tambah</span>
            </button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
          <div className="text-xs font-medium text-ink-slate mb-1 flex items-center gap-1.5">
            <span>Daftar variasi aktif</span>
            <span className="px-1.5 py-0.5 rounded bg-surface border border-hairline font-semibold tabular-nums text-ink">
              {constraints.length}
            </span>
          </div>

          <ul className="space-y-1.5">
            {constraints.map((rule, idx) => (
              <li
                key={`${idx}-${rule}`}
                data-testid={`constraint-item-${idx}`}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface border border-hairline text-xs"
              >
                <span className="text-ink font-normal">
                  <span className="font-medium text-ink-slate tabular-nums mr-1">
                    {idx + 1}.
                  </span>
                  {rule}
                </span>

                <button
                  type="button"
                  data-testid={`delete-constraint-btn-${idx}`}
                  aria-label={`Hapus aturan tantangan ${rule}`}
                  onClick={() => handleDelete(idx)}
                  className="min-h-[44px] min-w-[44px] p-2 text-ink-slate hover:text-ink rounded-lg hover:bg-canvas transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  title="Hapus Tantangan"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-hairline mt-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-5 py-2 rounded-lg bg-ink hover:bg-ink-deep text-white text-xs font-medium cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
