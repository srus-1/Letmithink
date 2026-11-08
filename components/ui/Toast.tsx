"use client";

import React from "react";

export interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  if (!message) return null;

  return (
    <div
      data-testid="toast-notification"
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 pl-4 pr-2 py-2 rounded-xl bg-ink text-white text-xs sm:text-sm shadow-lg border border-white/10 animate-in fade-in slide-in-from-bottom-2 select-none"
    >
      <span className="w-2 h-2 rounded-full bg-accent-lime shrink-0" aria-hidden="true" />
      <span className="font-medium">{message}</span>
      <button
        type="button"
        aria-label="Tutup Notifikasi"
        onClick={onClose}
        className="ml-1 text-white/70 hover:text-white cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10"
      >
        &times;
      </button>
    </div>
  );
}
