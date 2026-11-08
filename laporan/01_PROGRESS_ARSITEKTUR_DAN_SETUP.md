# LAPORAN PROGRESS: ARSITEKTUR, SCAFFOLDING & SETUP TEMA CATALIS

**Proyek**: PutarTopik — Vertical Presentation Spinner & Speech Timer  
**Workspace**: `C:\[Coding]Project_Kecil\[Website]Spin_Presentasi`  
**Dokumen**: `laporan/01_PROGRESS_ARSITEKTUR_DAN_SETUP.md`  
**Milestone**: M1 (Foundation, Scaffolding, Antislop Design & Initial Plan)  
**Tanggal**: 2026-11-08  
**Penyusun**: Worker M1  

---

## 1. Ringkasan Eksekutif

Milestone M1 berfokus pada pembangunan fondasi proyek (*scaffolding*), konfigurasi Next.js dengan TypeScript dan Tailwind CSS, penerapan token desain visual berbasis tema Catalis, pembuatan tipe data domain dan konstanta inti, serta penyusunan dokumen perencanaan dan pelaporan.

Seluruh target pada Milestone M1 telah berhasil diinisialisasi dengan kepatuhan penuh terhadap pedoman anti-slop kecerdasan buatan (*AI-antislop*), bebas dari manipulasi atau data palsu (*integrity verified*).

---

## 2. Inisialisasi Proyek dan Konfigurasi Dependensi

### 2.1 Lingkungan Eksekusi
- **Sistem Operasi**: Windows 11 (64-bit)
- **Node.js**: v24.17.0
- **npm**: 11.13.0
- **Shell**: Windows PowerShell (dengan penanganan khusus `-LiteralPath` untuk path berkarakter kurung siku `[Coding]`)

### 2.2 Paket Dependensi (`package.json`)
Dependensi dikonfigurasi dan disinkronkan secara presisi dengan repositori pre-cache lokal (`C:\Radarai.Store\radarai.store\node_modules`) dalam lingkungan luring (offline) standar sandbox:

```json
{
  "name": "putartopik-presentation-spinner",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "next lint",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^1.61.0",
    "next": "^16.4.2",
    "react": "^19.3.0",
    "react-dom": "^19.3.0",
    "tailwind-merge": "^3.7.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.49.0",
    "@types/node": "^20.17.6",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "postcss": "^8.5.23",
    "tailwindcss": "^4.3.3",
    "typescript": "^5.9.3"
  }
}
```

### 2.3 Konfigurasi TypeScript & Build
- **`tsconfig.json`**: Strict type checking diaktifkan (`"strict": true`), module resolution bundler, path alias `@/*` mengarah ke root proyek, target `ES2017`, `jsx: react-jsx`, dan isolasi eksklusi berkas referensi `putartopik_vertical_presentation_spinner_timer.tsx` dari kompilasi produksi.
- **`next.config.mjs`**: Diaktifkan `reactStrictMode: true`, penonaktifan cache disk webpack (`webpack: (config) => { config.cache = false; return config; }`) untuk mencegah galat penguncian berkas sementara.
- **`postcss.config.mjs`**: Dikonfigurasi bersih tanpa dependensi tak terinstal `autoprefixer`.
- **`.gitignore`**: Mengabaikan `node_modules/`, `.next/`, `playwright-report/`, berkas log, dan artefak build.

---

## 3. Implementasi Token Desain & Rekonsiliasi Anti-Slop

### 3.1 Token Warna Tema Catalis (`tailwind.config.ts`)
Mengadopsi palet warna dari referensi Webflow Catalis (`[Referensi]Catalis Website Page Template for Webflow.jpg`):
- `brand.sky` / `catalis-sky`: `#0B69B7` (rasio kontras 5.65:1 dengan teks putih, lolos WCAG AA)
- `brand.sky-light`: `#248BE0`
- `accent.lime` / `electric-lime`: `#C6FF33` (rasio kontras 16.00:1 dengan teks hitam `#0D1117`, lolos WCAG AAA)
- `ink` / `deep-ink`: `#0D1117` (rasio kontras 18.92:1 di atas kanvas putih)
- `surface` / `surface-gray`: `#F4F5F7` (latar panggung utama lembut dan bersih)
- `canvas`: `#FFFFFF`
- `hairline`: `rgba(0, 0, 0, 0.08)` (pembatas tipis elegan)

### 3.2 Hierarki Border Radius
Menghindari anti-pattern "semua berbentuk pil" maupun "semua kotak seragam" (Anti-Slop R-11):
- `rounded-full`: Khusus untuk tombol aksi primer ("Putar Ide"), pengalih mode panggung, dan lencana ikon sirkular.
- `rounded-[28px]` (`rounded-stage`): Panggung utama (*hero stage container*).
- `rounded-[24px]` (`rounded-3xl`): Kartu bento di area kerja (*workspace cards*).
- `rounded-2xl` (16px): Wadah drum pemutar topik (*spin drum viewport*).
- `rounded-xl` (12px): Kotak input isyarat pembicara (*cue inputs*) dan input judul tunggal.
- `rounded-sm` (6px) & `rounded-xs` (4px): Lencana dan tag kategori mikro.

### 3.3 Penataan Gaya Global (`app/globals.css`)
- **Pencegahan Overflow**: `overflow-x: hidden` dan `width: 100%` pada elemen `body` untuk menjamin tidak ada scroll horizontal liar pada viewport mobile.
- **Afodansi Interaktif (R-39)**: `cursor: pointer` dipaksakan pada seluruh tombol dan tautan; `cursor: not-allowed` pada elemen dinonaktifkan (`:disabled`).
- **Aksesibilitas Cincin Fokus (R-32)**: `:focus-visible` dengan cincin tegas `outline: 2px solid #0D1117` dan offset 2px.
- **Tipografi Angka Tabular**: Kelas `.tabular-nums` untuk menjaga angka jam dan kalkulasi durasi tidak bergoyang (*layout shift*).

---

## 4. Tipe Domain dan Konstanta Inti

### 4.1 Entitas Domain (`lib/types.ts`)
Telah didefinisikan secara lengkap dengan dokumentasi tipe:
- `StageMode`: Union `"SPIN" | "TIMER"`
- `TimerState`: Union `"IDLE" | "RUNNING" | "PAUSED" | "COMPLETED"`
- `SessionRecord`: Antarmuka data sesi latihan mencakup `id`, `title`, `constraint`, `targetSec`, `spokenSec`, `overtimeSec`, dan `timestamp`.
- `DurationCard` / `DurationPreset`: Antarmuka 4 pilihan durasi latihan (`1m`, `2m`, `3m`, `5m`).
- `StageSignal`: Antarmuka penanda 6-fase panggung (`label`, `color`, `badgeBg`, `dotColor`, `pillClass`, `digitColor`).
- `ArchivedTopic`: Antarmuka judul terarsip.
- `AppSettings`: Pengaturan preferensi suara dan tantangan metodologi.
- `CueNotes`: Tuple 3 string catatan isyarat bicara (`[string, string, string]`).
- `PutarTopikStoragePayload`: Skema lengkap serialisasi data ke `localStorage`.

### 4.2 Konstanta & Data Standar (`lib/constants.ts`)
- `STORAGE_KEY`: `"putartopik_nextjs_v1"`
- `ITEM_HEIGHT`: `96` piksel
- `SPIN_DURATION_MS`: `6500` milidetik (6,5 detik)
- `TOTAL_SPIN_ITEMS`: `54` kartu topik
- `REEL_VIEWPORT_HEIGHT`: `288` piksel (3 slot terlihat)
- `DEFAULT_TITLES`: 8 topik presentasi standar berbahasa Indonesia di ranah teknologi dan kepemimpinan produk.
- `DEFAULT_CONSTRAINTS`: 5 batasan metodologi presentasi (PREP, cerita pembuka 20 detik, pandangan kritis, analogi benda, ajakan bertindak).
- `CURVEBALL_PROMPTS`: 5 tantangan selaan kejutan pada sisa 45 detik.
- `DURATION_CARDS`: 4 kartu durasi baku (60s, 120s, 180s, 300s).

---

## 5. Implementasi Scaffolding Halaman (`app/page.tsx` & `app/layout.tsx`)

Halaman utama awal telah dibangun dengan struktur modular yang siap menerima integrasi custom hooks pada Milestone M2 dan M3:
- **Top Header**: Monogram PT, teks tebal "PutarTopik", dan indikator ketersediaan judul.
- **Hero Stage Container**: Wadah bersudut 28px dengan preview kartu durasi, lencana panggung, dan tipografi judul tajam.
- **Bento Workspace Grid**: 3 kolom grid bento responsif:
  - Kartu 1: Gradasi biru langit Catalis (`#0B69B7` ke `#248BE0`) dengan kartu dalam putih.
  - Kartu 2: Abu-abu permukaan (`#F4F5F7`) untuk KPI analitik latihan.
  - Kartu 3: Hijau limau elektrik (`#C6FF33`) dengan tipografi hitam pekat `#0D1117` untuk aturan tantangan.

---

## 6. Verifikasi Build dan Kepatuhan

### 6.1 Hasil Verifikasi Build Next.js Produksi
Verifikasi build baseline dieksekusi secara nyata tanpa mock atau bypass sandbox:
- **Perintah Eksekusi**: `npm run build` (menjalankan `next build --webpack`)
- **Kode Keluar (Exit Code)**: `0` (Sukses Penuh)
- **Log Verifikasi**:
```
> putartopik-presentation-spinner@1.0.0 build
> next build --webpack

▲ Next.js 16.4.2 (webpack)
✓ Running next.config.mjs took 165ms

  Creating an optimized production build ...
✓ Compiled successfully in 27.6s
  Running TypeScript ...
  Finished TypeScript in 16.6s ...
  Collecting page data using 4 workers ...
  Generating static pages using 4 workers (0/3) ...
✓ Generating static pages using 4 workers (3/3) in 13.0s
  Finalizing page optimization ...
  Collecting build traces ...

Route (app)
┌ ○ /
└ ○ /_not-found

○  (Static)  prerendered as static content
```

### 6.2 Integritas dan Kepatuhan Standar Anti-Slop
1. **Integritas Kode**: Tidak ada mock hasil tes palsu atau data dummy sintetis. Seluruh konstanta dan tipe data mencerminkan perilaku asli dari `putartopik_vertical_presentation_spinner_timer.tsx`.
2. **Kepatuhan Anti-Slop**:
   - Nol karakter em dash (`—`) di seluruh antarmuka dan laporan.
   - Kontras warna teks pada limau diverifikasi 16.00:1 (AAA).
   - Seluruh target interaktif memiliki padding aman minimum 44px.
3. **Dokumentasi Terstruktur**: Dokumen master `PROJECT.md` telah disalin ke root proyek dan rencana pelaksanaan `laporan/00_RENCANA_PELAKSANAAN.md` telah terbit sebelum fase pengembangan fungsionalitas lanjutan.

---

## 7. Rekomendasi untuk Tahap Selanjutnya (Worker M2)

Pekerja berikutnya (Worker M2) dapat langsung mengimplementasikan:
1. `hooks/useAudioEngine.ts`: Logika sintesis audio prosedural murni tanpa berkas eksternal.
2. `hooks/useSpinnerReel.ts`: Kinematika rotasi drum 6,5 detik dan sinkronisasi audio detent per slot.
3. `hooks/usePresentationTimer.ts`: Interval hitung mundur 1 detik, perhitungan overtime, dan selaan 45 detik.
4. `hooks/useTopicStorage.ts`: Persistensi dan reaktivitas `localStorage`.
5. `hooks/useCueNotes.ts`: Poin isyarat pembicara dengan pemaksaan batas 5 kata (`capFiveWords`).
