"use client";

import React from "react";
import { ShieldCheck, Database } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-hairline bg-canvas mt-8 py-5 px-5 sm:px-10 lg:px-16 text-xs text-ink-slate">
      <div className="max-w-[1280px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-ink shrink-0" aria-hidden="true" />
          <span>
            Data tersimpan otomatis di peramban ini tanpa dikirim ke server luar.
          </span>
        </div>

        <div className="flex items-center gap-4 text-ink-slate text-[11px]">
          <span className="flex items-center gap-1.5 font-medium text-ink">
            <ShieldCheck className="w-3.5 h-3.5 text-ink" aria-hidden="true" />
            <span>Berjalan penuh secara lokal</span>
          </span>
          <span>&copy; {new Date().getFullYear()} letmithink</span>
        </div>
      </div>
    </footer>
  );
}
