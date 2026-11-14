# Spec: AI Speech Coach & Stage Flow Hardening

## Objective
Memperkuat keandalan alur latihan panggung dan fitur AI Speech Coach di PutarTopik sebelum pengujian live dengan Gemini API dan penggunaan publik. Perubahan ini menutup celah sinkronisasi antara izin mikrofon dan timer, menjaga hasil evaluasi AI saat pengarsipan berlangsung paralel, mempertahankan rekaman sementara untuk coba ulang saat jaringan/API gagal, memanfaatkan catatan **Kerangka Bicara** sebagai konteks evaluasi, menekan latensi serta biaya token Gemini 3.8 Flash, dan menjaga kuota `localStorage` browser agar antrean topik tetap aman.

Target pengguna:
- **Pembicara individu (publik):** Berlatih bicara spontan secara mandiri dengan timer panggung dan evaluasi otomatis.
- **Pengelola situs:** Menanggung kuota API Gemini publik dengan batas 10 menit per rekaman dan rate limit per IP.

---

## Tech Stack
- **Framework:** Next.js `16.4.2` (App Router, Turbopack dev server), React `19.3.0`, TypeScript `5.9.3`
- **Styling:** Tailwind CSS `4.3.3` + `lucide-react` `1.61.0`
- **AI SDK:** `@google/genai` `3.2.0` (`client.interactions.create` dengan model `gemini-3.8-flash` dan `store: false`)
- **E2E Testing:** `@playwright/test` `1.65.0` (menggunakan Chromium / Chrome channel)

---

## Commands
- **Dev server:** `npm run dev`
- **Type check:** `npx tsc --noEmit`
- **Lint:** `npm run lint`
- **Production build:** `npm run build`
- **Full E2E test suite:** `npm run test:e2e`
- **Focused AI Coach E2E test:** `npx playwright test tests/e2e/tier1-features/13-ai-coach.spec.ts`

*Catatan lingkungan:* `playwright.config.ts` memakai `npx next start -p 3001 -H 127.0.0.1` sehingga membutuhkan hasil `npm run build` lebih dulu (di lingkungan offline tanpa akses font Google, `next dev` berjalan normal sedangkan `next build` memerlukan akses/cache font `Inter`).

---

## Project Structure
- `app/page.tsx` : Orkestrasi panggung utama (`usePresentationTimer`, `useSpeechCoach`, `useSpinnerReel`, `useCueNotes`, `useTopicStorage`)
- `app/api/coach/route.ts` : Route handler server (`POST /api/coach`) validasi audio, rate limit IP, dan pemanggilan Gemini Interactions API
- `hooks/useSpeechCoach.ts` : Manajemen `MediaRecorder`, timer rekam 10 menit, blob retry sementara, dan pemanggilan `/api/coach`
- `hooks/usePresentationTimer.ts` : Mesin timer panggung, sinyal fase, dan trigger `onTimeUp`
- `hooks/useTopicStorage.ts` : Persistensi `localStorage` (`letmithink_presentasi_v2`), statistik sesi, dan histori evaluasi AI
- `lib/types.ts` : Kontrak tipe domain (`CoachStatus`, `CoachResult`, `SessionRecord`, `CueNotes`)
- `lib/coach/limits.ts` : Konstanta batas durasi, bitrate, ukuran upload, dan kapasitas histori
- `lib/coach/prompts.ts` : Instruksi sistem mode Indonesia/Inggris dan penyusunan user prompt
- `lib/coach/schema.ts` : JSON Schema structured output dan normalisasi payload respons AI
- `components/stage/CoachPanel.tsx` : Panel kontrol AI Coach, indikator status rekam, dan kotak error/aksi pemulihan
- `components/stage/StageControls.tsx` : Tombol aksi panggung (`Mulai Timer`, `Jeda`, `Reset`, `Selesai & Arsipkan`)
- `components/workspace/StatsCard.tsx` : Tampilan KPI latihan dan daftar sesi beserta tombol `Lihat Feedback AI`
- `tests/e2e/tier1-features/13-ai-coach.spec.ts` : Pengujian end-to-end terautomasi untuk alur AI Coach

---

## Functional & Architecture Requirements

### 1. Sinkronisasi Izin Mikrofon dan Timer (`useSpeechCoach`, `app/page.tsx`, `StageControls`)
- Tambahkan status `"preparing"` pada `CoachStatus` di `lib/types.ts` (menandakan permintaan `getUserMedia` sedang menunggu izin pengguna).
- Saat `coach.enabled` bernilai `true` dan timer belum berjalan (`!timer.timerRunning`):
  - Menekan **Mulai Timer** atau pintasan keyboard `Space` mengubah status coach menjadi `"preparing"`, lalu memanggil `await coach.start()`.
  - Hitung mundur timer (`timer.start()`) **baru dimulai setelah** `coach.start()` berhasil (`true`).
  - Selama `coach.status === "preparing"`, klik ulang/tekan `Space` berulang diabaikan (mencegah dua stream mikrofon terbuka bersamaan) dan tombol `Mulai Timer` menampilkan label `"Menyiapkan mic..."` serta atribut `disabled`.
  - Jika `coach.start()` gagal (izin ditolak, mic tidak ditemukan, atau browser tidak mendukung), timer tetap dalam kondisi berhenti (`timerRunning === false`). Kotak alert error pada `CoachPanel` menampilkan tombol **`Lanjut Tanpa AI`** (menonaktifkan AI Coach dan langsung menjalankan `timer.start()`) di samping tombol **`Tutup`**.
- Ketika timer dalam posisi jeda (`timer.elapsedSec > 0 && coach.status === "paused"`), melanjutkan timer memanggil `coach.start()` (yang meresume `MediaRecorder` secara sinkron tanpa dialog ulang) lalu menjalankan `timer.start()`.

### 2. Siklus `00:00`, Anti-Double-Fire Timer, dan Penautan Hasil saat Arsip (`usePresentationTimer`, `useSpeechCoach`, `app/page.tsx`)
- Di `usePresentationTimer.ts`, pindahkan pemanggilan `onTimeUp` keluar dari updater `setElapsedSec` atau lindungi dengan guard sehingga `onTimeUp` hanya terpanggil tepat satu kali per akhir hitung mundur (aman di React StrictMode).
- Ketika timer mencapai `00:00`:
  - Topik aktif **tetap dipertahankan** di panggung (tidak otomatis diarsipkan), supaya pengguna dapat membaca modal feedback AI terlebih dahulu lalu memilih **Reset / Mulai Timer** ulang di topik yang sama atau menekan **Selesai & Arsipkan**.
  - `handleTimeUp` memulai `coach.finish(...)`.
- Penautan sesi arsip & pencegahan modal usang (*stale response*):
  - `useSpeechCoach` menyimpan identifier/run counter untuk setiap panggilan analisis yang sedang aktif (`activeRunIdRef`), beserta mekanisme mendaftarkan listener/callback atau mengembalikan promise hasil pada run aktif.
  - Jika pengguna menekan **Selesai & Arsipkan** saat `coach.status === "analyzing"` (analisis dari `00:00` belum selesai):
    - `storage.completeSession(...)` tetap menyimpan baris sesi baru (`saved.id`) ke `sessions`.
    - `app/page.tsx` mendaftarkan `saved.id` ke run analisis yang sedang berjalan sehingga begitu `finish()` selesai, `storage.attachCoachResult(saved.id, res)` tetap terpanggil secara otomatis meski stage sudah kembali ke mode `SPIN`.
  - Jika pengguna menekan **Putar Ide** untuk memulai topik baru **sebelum** analisis topik sebelumnya selesai:
    - Hasil AI dari topik lama tetap aman masuk ke `sessions` lewat `attachCoachResult(saved.id, res)` (bila sudah sempat diarsipkan), namun **tidak** memunculkan pop-up `CoachResultModal` secara tiba-tiba di atas putaran topik baru dan tidak menimpa status `CoachPanel` sesi baru.

### 3. Retensi Audio Sementara dan *Retry* Saat Analisis Gagal (`hooks/useSpeechCoach.ts`, `components/stage/CoachPanel.tsx`)
- Saat `finish(meta)` dipanggil:
  - Setelah `MediaRecorder` berhenti, simpan `{ blob, recordedSec, meta }` pada ref sementara (`lastFailedOrPendingRef`) di dalam `useSpeechCoach`. Jangan menghapusnya sebelum respons sukses diterima atau pengguna secara eksplisit memulai rekaman baru / menekan `Putar Ide` / menutup error (`clearResult` / `discard`).
  - Sebelum melakukan `fetch("/api/coach", ...)`, periksa `blob.size > COACH_MAX_UPLOAD_BYTES` di sisi klien agar kegagalan ukuran terdeteksi instan tanpa membuang bandwidth.
  - Gunakan `AbortController` dengan timeout klien `65_000` ms pada `fetch("/api/coach", ...)` agar panel tidak terjebak di `"analyzing"` tanpa akhir.
- Tambahkan fungsi `retry(): Promise<CoachResult | null>` pada `useSpeechCoach` serta properti `canRetry: boolean` (`Boolean(lastPayload && status === "error")`) dan `onRetry` ke `CoachPanel`:
  - Ketika pengiriman ke `/api/coach` gagal (timeout, jaringan terputus, HTTP `429`/`502`), `CoachPanel` menampilkan tombol **`Coba Analisis Ulang`** (tinggi minimal 44px) yang langsung mengirim ulang `blob` tersimpan ke `/api/coach` tanpa meminta pengguna merekam ulang.
  - Menekan `Tutup` (`onDismissError`) membersihkan error dan blob sementara di memori.

### 4. Konteks Catatan *Kerangka Bicara* ke Prompt AI (`lib/types.ts`, `lib/coach/prompts.ts`, `app/page.tsx`, `app/api/coach/route.ts`)
- Perluas `CoachSessionMeta` (di `hooks/useSpeechCoach.ts`) dan `PromptContext` (di `lib/coach/prompts.ts`) dengan `cues?: string[]`.
- Di `app/page.tsx`, baik `handleTimeUp` maupun `handleCompleteAndArchive` mengambil salinan teks terisi dari `cues.notes.filter((n) => n.trim().length > 0)` **sebelum** `cues.clearNotes()` dipanggil.
- Di `app/api/coach/route.ts`, baca `cues` dari `FormData` (dibatasi maksimal 3 item, masing-masing dipotong `slice(0, 120)`), dan teruskan ke `buildUserPrompt`.
- Di `lib/coach/prompts.ts`, jika `cues` tidak kosong, sertakan daftar poin kerangka pada prompt (`Kerangka bicara yang disiapkan pembicara: 1. ...`) serta instruksi menilai apakah pembicara benar-benar membahas poin yang direncanakannya dan mencatat kekurangan alurnya pada skor `Struktur` serta daftar `improvements`.

### 5. Efisiensi Gemini 3.8 Flash & Timeout Server (`app/api/coach/route.ts`)
- Tambahkan konfigurasi `generation_config: { thinking_level: "low" }` pada `client.interactions.create(...)` di `app/api/coach/route.ts` untuk menekan waktu tunggu respons dan pemakaian token publik.
- Sertakan `timeout_ms: 55_000` pada opsi kedua (`RequestOptions`) `client.interactions.create(..., { timeout_ms: 55_000 })` agar pemanggilan API berhenti bersih sebelum batas `maxDuration = 60` platform habis, dan berikan pesan error timeout yang informatif.
- Perluas normalisasi MIME audio pada `MIME_MAP` (`"audio/x-m4a": "audio/m4a"` serta fallback aman bila `audio.type` kosong dari browser tertentu dengan nama blob tervalidasi).

### 6. Batas Kapasitas Riwayat `localStorage` (`lib/coach/limits.ts`, `hooks/useTopicStorage.ts`)
- Definisikan konstanta `COACH_HISTORY_MAX_DETAILS = 20` di `lib/coach/limits.ts`.
- Buat helper pemangkasan murni untuk array `sessions`:
  - Pertahankan objek `.coach` lengkap (transkrip, koreksi, skor, versi perbaikan) hanya untuk **20 sesi terbaru yang memiliki `.coach`**. Untuk sesi yang lebih tua dari batas tersebut, hapus properti `coach` namun tetap simpan metadata durasi dan metrik waktu (`targetSec`, `spokenSec`, `overtimeSec`, `title`, `timestamp`) supaya `Total Sesi`, `Tepat Waktu`, dan `Rata-rata Durasi` tetap akurat.
- Di blok `catch` saat menulis `localStorage.setItem(STORAGE_KEY, ...)`:
  - Jika penyimpanan gagal karena kuota browser (`QuotaExceededError` atau sejenisnya), lakukan fallback bertahap dengan menghapus detail `.coach` dari sesi lama terlebih dahulu dan mencoba menulis ulang sehingga `activeTitles`, `archivedTitles`, dan `constraints` tidak pernah gagal tersimpan secara diam-diam.

---

## Code Style
Mengikuti konvensi proyek: TypeScript ketat dengan fungsi pembantu kecil ber-early-return, aturan Antislop penuh (tanpa em dash, tanpa kontainer pill pembungkus atau label `"Aktif"`/`"Mati"` di tombol switch, serta tanpa teks dalam tanda kurung pada headline/subheadline UI).

Contoh pola fungsi & tipe:
```ts
const parseCues = (raw: FormDataEntryValue | null): string[] => {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, 3)
      .map((item) => item.trim().slice(0, 120));
  } catch {
    return [];
  }
};
```

---

## Testing Strategy
- **Static Checks:** `npx tsc --noEmit` dan `npm run lint` wajib lulus tanpa error di setiap checkpoint.
- **Automated E2E (`tests/e2e/tier1-features/13-ai-coach.spec.ts`):**
  - Pengujian wajib dengan API mock (`page.route("**/api/coach", ...)`) dan mock `MediaRecorder` untuk memverifikasi:
    1. Mic permission delay -> timer baru berjalan setelah `getUserMedia` selesai, dan jika mic ditolak muncul **`Lanjut Tanpa AI`** untuk menyalakan timer tanpa AI.
    2. Failure + Retry -> server mengembalikan `502` pada percobaan pertama, tombol **`Coba Analisis Ulang`** muncul, dan klik ulang menghasilkan modal `Evaluasi Latihan Bicara` dengan payload audio tetap utuh.
    3. Pending archive sync -> saat timer habis dan AI sedang menganalisis (delay mock), mengklik **Selesai & Arsipkan** tetap menautkan tombol `Lihat Feedback AI` ke baris sesi arsip begitu respons tiba, sekaligus memastikan catatan `Kerangka Bicara` terkirim di `FormData`.
    4. Penyimpanan riwayat dibatasi 20 detail `.coach` tanpa memutus penyimpanan antrean topik.
- **Manual / Live Verification (opsional dengan API key user):** Isi `.env.local` dengan `GEMINI_API_KEY`, restart `npm run dev`, rekam suara asli >= 5 detik di mode *Public Speaking* maupun *English Grammar*, dan cek kecepatan serta kelengkapan output terstruktur.

---

## Boundaries
- **Always do:**
  - Jalankan `npx tsc --noEmit` dan `npm run lint` sebelum menyelesaikan perubahan.
  - Pertahankan area klik tombol baru minimal `min-h-[44px]` sesuai standar aksesibilitas proyek.
  - Patuhi standar UI & copywriting Antislop (Bahasa Indonesia ringkas, tanpa em dash, tanpa tanda kurung di judul/subjudul).
- **Ask first:**
  - Mengubah nilai `COACH_MAX_RECORD_SEC` (600d / 10 menit), batas rate limit (`COACH_RATE_LIMIT`), atau menambah dependensi npm baru.
  - Mengubah struktur `COACH_RESPONSE_SCHEMA` yang memengaruhi kompatibilitas data sesi lama di `localStorage`.
- **Never do:**
  - Menyimpan audio rekaman pengguna secara permanen ke server atau database (`store` harus selalu `false`).
  - Mengubah atau berkomitmen menyimpan `.env.local` beserta `GEMINI_API_KEY` ke repositori.
  - Menghapus atau melemahkan assertion pada suite test yang sudah ada.

---

## Success Criteria
1. Saat AI Coach aktif, menekan **Mulai Timer** menunda hitung mundur sampai izin mic selesai diberikan; jika mic gagal, timer tidak berjalan dan klik **Lanjut Tanpa AI** langsung memulai timer tanpa AI.
2. Pada `00:00`, topik tetap di panggung; mengklik **Selesai & Arsipkan** selagi AI masih `analyzing` tetap memunculkan tombol **Lihat Feedback AI** di baris riwayat sesi tersebut setelah request selesai, dan memutar topik baru di tengah proses tidak memunculkan modal topik lama secara tiba-tiba.
3. Kegagalan HTTP/timeout pada `/api/coach` menyisakan blob di memori dan memunculkan tombol **Coba Analisis Ulang** yang berfungsi mengirim ulang audio yang sama tanpa rekam ulang.
4. Poin non-kosong dari **Kerangka Bicara** terkirim dalam `FormData` `/api/coach` dan masuk ke prompt Gemini.
5. `client.interactions.create` memanggil `gemini-3.8-flash` dengan `generation_config: { thinking_level: "low" }` serta `timeout_ms: 55_000`.
6. Detail `.coach` pada `sessions` dibatasi maksimal 20 sesi terbaru di `localStorage`, dan fallback penulisan kuota tidak pernah membuang `activeTitles` atau `archivedTitles`.
7. `npx tsc --noEmit`, `npm run lint` (0 errors), dan test E2E AI Coach lolos seluruhnya.

---

## Open Questions
1. Pada kotak error saat **Coba Analisis Ulang** muncul (setelah kegagalan `/api/coach`), apakah sudah cukup menampilkan tombol `Coba Analisis Ulang` + `Tutup`, atau perlu teks peringatan khusus bila user berpindah topik agar tahu rekaman lama akan terhapus? (Asumsi awal: cukup teks jelas di banner bahwa rekaman tersimpan sementara hingga sesi baru dimulai.)
2. Untuk verifikasi akhir setelah implementasi, apakah `tests/e2e/tier1-features/13-ai-coach.spec.ts` akan dijalankan terhadap mock server di `next dev` / `next start` saja, atau kamu ingin langsung menguji dengan `GEMINI_API_KEY` asli di `.env.local`?
