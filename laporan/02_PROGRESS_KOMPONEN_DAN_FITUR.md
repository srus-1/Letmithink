# LAPORAN PROGRESS: DOMAIN HOOKS, KOMPONEN MODULAR & FITUR INTERAKTIF

**Proyek**: PutarTopik - Vertical Presentation Spinner & Speech Timer  
**Workspace**: `C:\[Coding]Project_Kecil\[Website]Spin_Presentasi`  
**Dokumen**: `laporan/02_PROGRESS_KOMPONEN_DAN_FITUR.md`  
**Milestone**: M2-M3 (Core Domain Hooks, Modular UI Components & Full Feature Rebuild)  
**Tanggal**: 2026-11-08  
**Penyusun**: Worker M2-M3  

---

## 1. Ringkasan Eksekutif

Milestone M2-M3 merekonstruksi seluruh fungsionalitas dan logika interaktif dari kode monolitik referensi `putartopik_vertical_presentation_spinner_timer.tsx` ke dalam arsitektur modern Next.js (React 19 / App Router) yang terdecoupling secara bersih:
1. **Sintesis Audio Prosedural Murni**: Mengimplementasikan Web Audio API tanpa berkas audio eksternal (efek klik haptik mahkota putar digital dan dentang kunci pemenang D5/A5).
2. **Koleksi Custom Domain Hooks**: Memisahkan state dan logika bisnis ke dalam 5 custom hooks independen (`useAudioEngine`, `useSpinnerReel`, `usePresentationTimer`, `useTopicStorage`, `useCueNotes`).
3. **Komponen Modular & Kartu Bento**: Memecah tampilan panggung utama dan area kerja menjadi komponen berkas tunggal yang terisolasi dengan penataan visual tema Catalis.
4. **Dialog Modal & Laci Pengarsipan**: Menyediakan dialog impor massal, pengelolaan aturan tantangan bicara, laci arsip judul selesai, dan modal preferensi pengaturan.
5. **Kepatuhan AI-Antislop & Selektor E2E**: Menegakkan target sentuh minimum 44px, rasio kontras WCAG AAA pada teks limau elektrik, nol karakter em dash (`—`), serta menyematkan lebih dari 35 atribut `data-testid` deterministik untuk pengujian otomatis Playwright.

---

## 2. Arsitektur Domain Hooks & Mesin Logika

### 2.1 Sintesis Audio Prosedural (`lib/audio.ts` & `hooks/useAudioEngine.ts`)
Aplikasi PutarTopik tidak mengunduh berkas audio MP3 atau WAV sama sekali. Seluruh gelombang suara disintesis secara instan melalui Web Audio API (`AudioContext`):
- **Lazy Initialization & Autoplay Handling**: `getAudioContext()` menginisialisasi `AudioContext` saat ada gestur pengguna dan memanggil `resume()` jika browser menangguhkan audio context karena kebijakan autoplay peramban modern.
- **Apple Watch / Digital Crown Detent Click (`playDetentClick`)**:
  - Osilator gelombang segitiga (*triangle wave*) yang frekuensinya meluncur turun dari `(1350 + velocityRatio * 350)` Hz menuju 290 Hz dalam 11ms (`exponentialRampToValueAtTime`).
  - Semprotan derau putih mikro (*white-noise burst*) selama 7ms dengan peredaman eksponensial yang difilter melalui `BiquadFilterNode` tipe *bandpass* pada frekuensi 2600 Hz ($Q = 3.2$).
  - Menghasilkan klik mekanis kayu bertekstur yang semakin dalam nadanya saat drum melambat.
- **Lock-in Chime (`playLockChime`)**:
  - Akor dua nada sinus berurutan: D5 (587,33 Hz) dan A5 (880,00 Hz) dengan jeda 65ms dan peluruhan eksponensial selama 420ms.
- **State Suara Global**: Status aktif/bisu disimpan dan disinkronkan secara reaktif ke `localStorage`.

### 2.2 Kinematika & Fisika Drum Putar (`hooks/useSpinnerReel.ts`)
- **Geometri Slot**: Ketinggian slot `ITEM_HEIGHT = 96px`, ketinggian viewport `REEL_VIEWPORT_HEIGHT = 288px` (menampilkan tepat 3 baris kartu topik).
- **Penjajaran Baris Pilihan**: Bingkai sorotan tengah setinggi 96px dengan latar `#C6FF33` opasitas 15%, dibatasi garis tepi 2px `#0D1117`, dan diapit dua detent penanda vertikal hitam.
- **Pembangkit Urutan 54 Kartu**:
  - Menjamin kartu berurutan tidak duplikat (`pick !== sequence[i - 1]`).
  - Menjamin kartu tepat sebelum kartu pemenang (indeks 51) berbeda dari pemenang (indeks 52), sehingga transisi pergeseran terakhir melintasi batas tengah terasa dramatis.
- **Kurva Perlambatan Kuintik**:
  - Digerakkan oleh perulangan `requestAnimationFrame` selama 6500 milidetik (6,5 detik).
  - Rumus kurva perlambatan: $\text{eased} = 1 - (1 - \text{progress})^{4.5}$.
  - Fase akhir (~2,2 detik terakhir) merayap perlahan melintasi 5 kartu terakhir dengan kecepatan instan $(1 - \text{progress})^{3.5}$ yang memicu suara klik detent setiap melintasi batas piksel slot.
- **Penguncian Otomatis**: Saat putaran berakhir, topik terkunci otomatis (`isLocked = true`) dan memainkan dentang `playLockChime()`.

### 2.3 Mesin Timer Panggung & Sinyal 6-Fase (`hooks/usePresentationTimer.ts`)
- **Interval Presisi**: Menggunakan interval 1000ms yang mengakumulasi `elapsedSec` dan menghitung sisa waktu `remainingSec = targetSec - elapsedSec`.
- **Format Jam Raksasa Tabular**:
  - Menggunakan tipografi fluida responsif `clamp(3.5rem, 14vw, 10.5rem)` dan kelas `.tabular-nums` untuk mencegah pergeseran angka saat countdown.
  - Memformat waktu lewat batas (*overtime*) dengan prefiks `+` (contoh: `+00:00:15`).
- **Sinyal Panggung 6-Fase**:
  1. *Siap Mulai*: Titik abu-abu, teks `#0D1117` saat timer dalam kondisi awal belum dijalankan.
  2. *Fase Awal*: Titik biru aksen `#0969B8`, lencana biru muda saat waktu bicara < 50% target.
  3. *50% Durasi Tercapai*: Titik hijau zamrud, digit hijau saat waktu bicara mencapai separuh target.
  4. *Sisa 30 Detik*: Titik kuning amber, digit kuning amber saat waktu tersisa 30 hingga 11 detik.
  5. *Sisa 10 Detik*: Titik merah menyala, digit merah saat waktu tersisa 10 hingga 0 detik.
  6. *Lewat Waktu*: Lencana merah solid teks putih, digit merah saat waktu melebihi target durasi.
- **Tantangan Selaan 45 Detik (Curveball)**: Saat opsi diaktifkan dan timer menyentuh sisa 45 detik, sistem menginjeksi tantangan improvisasi spontan secara acak dari `CURVEBALL_PROMPTS` ke spanduk peringatan panggung.

### 2.4 Persistensi Data & Manajemen Riwayat (`hooks/useTopicStorage.ts`)
- **Kunci Penyimpanan**: `putartopik_nextjs_v1` di `localStorage`.
- **Perlindungan Hidrasi SSR**: State `hydrated` memastikan pembacaan browser lokal hanya dieksekusi di sisi klien (*client mount*), mencegah peringatan ketidaksesuaian markup hidrasi React 19 / Next.js.
- **Manajemen Topik Lengkap**:
  - Tambah topik tunggal dengan pemeriksaan duplikasi.
  - Impor massal baris banyak (*newline-delimited*) dengan penyaringan baris kosong dan baris duplikat.
  - Pengarsipan topik selesai saat sesi latihan rampung.
  - Pemulihan topik tunggal atau pemulihan seluruh topik arsip sekaligus.
  - Penambahan dan penghapusan aturan tantangan dengan pengaman minimal 1 aturan tersisa.
  - Penghitungan metrik KPI latihan (persentase tepat waktu dan durasi rata-rata bicara).

### 2.5 Catatan Isyarat Pembicara 3 Poin (`hooks/useCueNotes.ts`)
- Menyediakan 3 kolom masukan isyarat: Pembuka (*hook*), Poin Inti (*core message*), dan Penutup (*call to action*).
- Menegakkan batas ketat maksimal 5 kata per poin melalui fungsi `capFiveWords`: memecah string menjadi token kata dan memotong pada indeks ke-5 dengan spasi penutup.
- Menampilkan lencana penghitung kata langsung (*N/5 kata*).

---

## 3. Dekomposisi Komponen Modular

Seluruh tampilan antarmuka dipecah menjadi modul independen di bawah direktori `components/`:

| Direktori | Berkas Komponen | Peran & Fungsionalitas |
|---|---|---|
| `components/layout/` | `Header.tsx` | Navigasi atas, logo PT, penghitung judul aktif, pengalih mode panggung, tombol bisu suara, dan pemicu modal pengaturan. |
| `components/layout/` | `Footer.tsx` | Keterangan penyimpanan offline peramban lokal, jaminan privasi, dan hak cipta. |
| `components/stage/` | `StageContainer.tsx` | Wadah panggung utama bersudut 28px (`rounded-[28px]`), mengatur tampilan antara drum putar dan jam raksasa. |
| `components/stage/` | `SlotReel.tsx` | Drum slot vertikal 3 baris (tinggi 288px), gradien vignetting atas/bawah, bingkai sorotan tengah dengan detent ganda, dan status pergerakan. |
| `components/stage/` | `TimerClock.tsx` | Penampil jam raksasa tabular dengan tipografi fluida, lencana status 6-fase, dan keterangan topik aktif. |
| `components/stage/` | `StageControls.tsx` | Kluster tombol aksi ("Putar Ide", "Buka Timer", "Mulai/Jeda", "Reset", "Selesai & Arsipkan"), 4 kartu preset durasi, tombol kunci topik, dan input durasi kustom (1-120 menit). |
| `components/stage/` | `CueNotesBar.tsx` | 3 baris catatan isyarat bicara berbatas 5 kata, kotak centang selaan 45 detik, dan spanduk tantangan spontan dengan tombol tutup. |
| `components/workspace/` | `BentoGrid.tsx` | Tata letak bento 12 kolom responsif di bawah panggung utama yang membungkus 4 kartu instrumen latihan. |
| `components/workspace/` | `TopicQueueCard.tsx` | Kartu gradasi biru langit Catalis (`#0B69B7` ke `#248BE0`) dengan formulir tambah tunggal, pemicu impor massal, dan daftar antrean scrollable. |
| `components/workspace/` | `StatsCard.tsx` | Kartu permukaan abu-abu (`#F4F5F7`) berisi KPI total sesi, persentase tepat waktu, durasi rata-rata, dan log sesi latihan masa lalu. |
| `components/workspace/` | `ConstraintCard.tsx` | Kartu hijau limau elektrik (`#C6FF33`) dengan teks hitam pekat `#0D1117` untuk mengelola aturan metodologi bicara dan tombol acak tantangan. |
| `components/workspace/` | `ArchiveCard.tsx` | Kartu hitam obsidian (`#0D1117`) dengan angka lencana limau untuk melihat dan memulihkan topik terarsip. |
| `components/modals/` | `BulkAddModal.tsx` | Dialog pop-up impor massal multi-baris dengan textarea luas dan tombol simpan. |
| `components/modals/` | `ConstraintModal.tsx` | Dialog pop-up pengelolaan aturan tantangan bicara secara komprehensif. |
| `components/modals/` | `ArchiveDrawer.tsx` | Laci samping untuk melihat daftar lengkap topik yang telah diarsipkan dan memulihkan satu per satu atau sekaligus. |
| `components/modals/` | `SettingsModal.tsx` | Dialog pengaturan preferensi audio, selaan 45 detik, pasangan tantangan, serta tombol reset data bawaan. |
| `components/ui/` | `Toast.tsx` | Pil notifikasi mengambang di pojok kanan bawah dengan titik indikator limau dan auto-dismiss 3 detik. |

---

## 4. Kepatuhan Desain Catalis & Standar AI-Antislop

1. **Palet Warna Terverifikasi**:
   - Teks hitam pekat `#0D1117` di atas latar limau elektrik `#C6FF33` (rasio kontras 16,00:1, melampaui standar WCAG AAA).
   - Teks putih di atas biru langit `#0B69B7` (rasio kontras 5,65:1, memenuhi WCAG AA).
   - Dilarang keras teks putih di atas latar limau (kontras 1,18:1 yang tidak terbaca).
2. **Ukuran Target Sentuh (Tap Targets >= 44px)**:
   - Seluruh tombol aksi, tab pengalih, tombol ikon, kotak centang, dan kolom input memiliki tinggi minimum 44px (`min-h-[44px]`).
3. **Larangan Karakter Em Dash (R-02 / R-16)**:
   - Nol karakter em dash (`—`) di seluruh teks antarmuka, judul, maupun berkas laporan. Diganti dengan titik dua, tanda kurung, atau titik.
4. **Tipografi Fluida & Responsif (R-03)**:
   - Tampilan jam menggunakan `clamp(3.5rem, 14vw, 10.5rem)` sehingga tidak pernah terjadi overflow horizontal pada layar ponsel sekecil apa pun.
   - Grid bento 12 kolom secara elegan mengalir (*reflow*) menjadi 1 kolom vertikal pada layar di bawah 1024px.
5. **Pintasan Papan Ketik**:
   - `Spasi`: Mulai / Jeda timer panggung.
   - `R`: Reset waktu dan status panggung.
   - `P`: Putar ide topik baru.

---

## 5. Registri Atribut `data-testid` untuk Agen E2E

Untuk memastikan agen pengujian otomatis E2E (Playwright) dapat menguji seluruh alur interaktif tanpa kegagalan selektor DOM, seluruh elemen kunci telah dilengkapi atribut `data-testid` deterministik:

| Wilayah Komponen | Atribut `data-testid` | Elemen HTML | Deskripsi Uji |
|---|---|---|---|
| **Header** | `navbar` | `<header>` | Kontainer navigasi utama |
| | `mode-spin-btn` | `<button>` | Pengalih mode panggung ke Putar Ide |
| | `mode-timer-btn` | `<button>` | Pengalih mode panggung ke Timer |
| | `active-topic-counter` | `<span>` | Lencana angka topik aktif |
| | `toggle-sound-btn` | `<button>` | Sakelar hidup/mati suara Web Audio |
| | `open-settings-btn` | `<button>` | Pemicu modal dialog pengaturan |
| **Drum Slot Panggung** | `spin-drum-container` | `<div>` | Kotak penampung luar drum slot |
| | `slot-reel-viewport` | `<div>` | Jendela viewport drum (288px) |
| | `spin-reel-sequence` | `<div>` | Elemen terjemahan animasi CSS translate3d |
| | `slot-reel-item-{idx}` | `<div>` | Setiap slot judul di dalam urutan drum |
| | `center-highlight-frame` | `<div>` | Bingkai sorotan pilihan tengah 96px |
| | `spin-status-label` | `<span>` | Label status interaksi drum |
| **Jam Panggung** | `giant-clock-display` | `<div>` | Kontainer jam raksasa tabular |
| | `timer-display` | `<div>` | Angka jam hitung mundur `HH:MM:SS` |
| | `stage-signal-badge` | `<div>` | Lencana sinyal 6-fase panggung |
| | `timer-signal-dot` | `<span>` | Titik warna indikator fase |
| | `timer-active-topic-text` | `<div>` | Teks judul topik aktif di bawah jam |
| **Kontrol Panggung** | `active-topic-heading` | `<h1>` | Judul topik terpilih saat ini |
| | `active-constraint-text` | `<p>` | Teks tantangan bicara terpilih |
| | `lock-topic-btn` | `<button>` | Tombol kunci / buka kunci topik |
| | `spin-btn` | `<button>` | Tombol utama "Putar Ide" |
| | `open-timer-btn` | `<button>` | Tombol "Buka Timer" |
| | `start-timer-btn` / `pause-timer-btn` | `<button>` | Tombol "Mulai Timer" / "Jeda" |
| | `reset-timer-btn` | `<button>` | Tombol "Reset" waktu panggung |
| | `complete-archive-btn` | `<button>` | Tombol "Selesai & Arsipkan" |
| | `preset-1m`, `2m`, `3m`, `5m` | `<button>` | 4 kartu pilihan durasi latihan |
| | `custom-duration-input` | `<input>` | Kolom input menit kustom |
| | `apply-custom-duration-btn` | `<button>` | Tombol terapkan menit kustom |
| **Isyarat & Selaan** | `cue-input-0`, `1`, `2` | `<input>` | 3 kolom catatan isyarat bicara |
| | `cue-word-count-0`, `1`, `2` | `<span>` | Lencana penghitung kata (*N/5*) |
| | `toggle-curveball-setting` | `<input>` | Kotak centang selaan 45 detik |
| | `curveball-banner` | `<div>` | Spanduk tantangan spontan 45 detik |
| | `dismiss-curveball-btn` | `<button>` | Tombol tutup spanduk selaan |
| **Area Antrean Topik** | `add-title-input` | `<input>` | Input cepat tambah topik tunggal |
| | `add-title-btn` | `<button>` | Tombol kirim topik tunggal |
| | `open-bulk-modal-btn` | `<button>` | Tombol buka modal impor massal |
| | `bulk-titles-textarea` | `<textarea>` | Textarea baris banyak untuk topik |
| | `save-bulk-btn` | `<button>` | Tombol simpan baris impor massal |
| | `active-topic-item-{idx}` | `<li>` | Baris item topik dalam daftar antrean |
| | `archive-active-btn` | `<button>` | Tombol arsip per baris topik |
| | `delete-active-btn` | `<button>` | Tombol hapus permanen per baris |
| **Statistik & Riwayat**| `stat-total-speeches` | `<div>` | Angka total sesi bicara selesai |
| | `stat-ontime-rate` | `<div>` | Angka persentase tepat waktu |
| | `stat-avg-duration` | `<div>` | Angka rata-rata durasi bicara |
| | `session-log-card-{idx}` | `<div>` | Kartu riwayat sesi masa lalu |
| | `clear-history-btn` | `<button>` | Tombol bersihkan seluruh riwayat |
| **Aturan Tantangan** | `constraint-reel-toggle` | `<button>` | Sakelar pasangan tantangan bicara |
| | `shuffle-constraint-btn` | `<button>` | Tombol acak tantangan aktif |
| | `open-constraint-modal-btn` | `<button>` | Tombol buka modal aturan tantangan |
| | `add-constraint-input` | `<input>` | Input tambah aturan tantangan baru |
| | `save-constraint-btn` | `<button>` | Tombol simpan aturan tantangan |
| | `constraint-item-{idx}` | `<li>` | Baris item aturan tantangan |
| | `delete-constraint-btn-{idx}` | `<button>` | Tombol hapus aturan tantangan |
| **Arsip & Pemulihan** | `archived-count-badge` | `<span>` | Angka total judul terarsip |
| | `restore-all-btn` | `<button>` | Tombol kembalikan semua ke antrean |
| | `open-archive-drawer-btn` | `<button>` | Tombol buka laci arsip lengkap |
| | `restore-item-{idx}` | `<button>` | Tombol pulihkan topik individual |
| **Notifikasi** | `toast-notification` | `<div>` | Pil pemberitahuan mengambang |

---

## 6. Integrasi & Kesiapan Lanjutan

Seluruh artefak komponen, custom hooks, dan integrasi di `app/page.tsx` telah selesai diimplementasikan secara komprehensif. Aplikasi PutarTopik kini siap diverifikasi melalui kompilasi produksi `npm run build` dan diserahterimakan kepada agen pengujian otomatis E2E Playwright.
