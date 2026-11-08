"use client";

import React, { useState } from "react";
import { SlidersHorizontal, Plus, X, Shuffle, Settings } from "lucide-react";

export interface ConstraintCardProps {
  constraints: string[];
  activeConstraint: string | null;
  useConstraintReel: boolean;
  onToggleReel: () => void;
  onShuffleConstraint: () => void;
  onAddConstraint: (rule: string) => boolean;
  onDeleteConstraint: (idx: number) => boolean;
  onOpenModal: () => void;
  onNotify: (msg: string) => void;
}

export function ConstraintCard({
  constraints,
  activeConstraint,
  useConstraintReel,
  onToggleReel,
  onShuffleConstraint,
  onAddConstraint,
  onDeleteConstraint,
  onOpenModal,
  onNotify,
}: ConstraintCardProps) {
  const [newRuleInput, setNewRuleInput] = useState("");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newRuleInput.trim();
    if (!clean) return;
    const ok = onAddConstraint(clean);
    if (ok) {
      setNewRuleInput("");
      onNotify("Aturan tantangan baru berhasil ditambahkan.");
    } else {
      onNotify("Aturan tantangan tersebut sudah ada di daftar.");
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
      id="aturan-tantangan"
      className="w-full rounded-2xl p-5 sm:p-6 bg-[#F4F5F7] text-[#0D1117] border border-slate-200 shadow-2xs flex flex-col"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-base font-semibold tracking-tight text-[#0D1117] leading-tight">
          Aturan Tantangan Bicara
        </h2>

        <button
          type="button"
          data-testid="constraint-reel-toggle"
          aria-label={useConstraintReel ? "Nonaktifkan Pasangan Tantangan" : "Aktifkan Pasangan Tantangan"}
          onClick={onToggleReel}
          className={`min-h-[44px] px-3 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
            useConstraintReel
              ? "bg-[#C6FF33] text-[#0D1117] border border-slate-900/15"
              : "bg-slate-200 text-slate-600 border border-slate-300"
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{useConstraintReel ? "Aktif" : "Mati"}</span>
        </button>
      </div>

      <div
        className={`rounded-xl p-3.5 mb-4 flex items-center justify-between gap-2.5 transition-opacity ${
          useConstraintReel
            ? "bg-slate-900 text-white"
            : "opacity-50 bg-slate-200 text-slate-500 border border-slate-300"
        }`}
      >
        <div className="min-w-0">
          <div
            className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5 ${
              useConstraintReel ? "text-[#C6FF33]" : "text-slate-500"
            }`}
          >
            {useConstraintReel ? "Tantangan aktif saat ini" : "Status tantangan"}
          </div>
          <p
            data-testid="card-active-constraint-text"
            className={`text-xs sm:text-sm font-medium line-clamp-2 leading-snug ${
              useConstraintReel ? "text-white" : "text-slate-500"
            }`}
          >
            {useConstraintReel
              ? activeConstraint || "Aturan pembawaan diacak otomatis bersama topik."
              : "Tantangan dinonaktifkan untuk sesi ini"}
          </p>
        </div>
        <button
          type="button"
          data-testid="shuffle-constraint-btn"
          aria-label="Acak Ulang Tantangan"
          disabled={!useConstraintReel}
          onClick={onShuffleConstraint}
          className={`min-h-[44px] min-w-[44px] p-2 rounded-md transition-colors flex items-center justify-center shrink-0 ${
            useConstraintReel
              ? "bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              : "bg-slate-300/60 text-slate-400 cursor-not-allowed"
          }`}
          title="Ganti Tantangan Acak"
        >
          <Shuffle className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleAddSubmit} className="mb-4">
        <label htmlFor="new-constraint-input" className="sr-only">
          Aturan tantangan baru
        </label>
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 focus-within:border-slate-900 transition-colors">
          <input
            type="text"
            data-testid="quick-add-constraint-input"
            id="new-constraint-input"
            aria-label="Aturan tantangan baru"
            placeholder="Tambah aturan tantangan..."
            value={newRuleInput}
            onChange={(e) => setNewRuleInput(e.target.value)}
            className="w-full bg-transparent px-2.5 py-1 text-xs sm:text-sm text-[#0D1117] placeholder:text-slate-400 focus:outline-none min-h-[38px]"
          />
          <button
            type="submit"
            data-testid="quick-save-constraint-btn"
            id="add-constraint-btn"
            aria-label="Simpan aturan tantangan"
            className="min-h-[44px] min-w-[44px] px-3 py-1.5 rounded-md bg-[#C6FF33] hover:bg-[#B5F01E] text-[#0D1117] font-semibold flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-slate-900/10"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </form>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 mb-3 pb-2 border-b border-slate-200 bg-[#F4F5F7]">
          <span>Daftar Variasi ({constraints.length})</span>
          <button
            type="button"
            data-testid="open-constraint-modal-btn"
            onClick={onOpenModal}
            className="min-h-[36px] px-2 hover:underline flex items-center gap-1 font-semibold text-[#0D1117] cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Kelola Semua</span>
          </button>
        </div>

        <ul className="divide-y divide-slate-200/80 max-h-[280px] overflow-y-auto pt-2 pb-4 px-1">
          {constraints.map((rule, idx) => (
            <li
              key={`${idx}-${rule}`}
              data-testid={`card-constraint-item-${idx}`}
              className="flex items-start justify-between gap-2 py-2 px-1.5 rounded-md hover:bg-white/70 text-xs sm:text-sm transition-colors"
            >
              <span className="line-clamp-2 leading-snug text-[#0D1117] font-normal pt-1">
                <span className="font-medium text-slate-500 tabular-nums mr-1.5">
                  {idx + 1}.
                </span>
                {rule}
              </span>

              <button
                type="button"
                data-testid={`card-delete-constraint-btn-${idx}`}
                aria-label={`Hapus aturan tantangan ${rule}`}
                onClick={() => handleDelete(idx)}
                className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-[#0D1117] rounded-md transition-colors cursor-pointer flex items-center justify-center shrink-0"
                title="Hapus Tantangan"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
