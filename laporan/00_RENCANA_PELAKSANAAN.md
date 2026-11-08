# RENCANA PELAKSANAAN: REBUILD PUTARTOPIK KE NEXT.JS & TAILWIND

**Proyek**: PutarTopik — Vertical Presentation Spinner & Speech Timer  
**Workspace**: `C:\[Coding]Project_Kecil\[Website]Spin_Presentasi`  
**Dokumen**: `laporan/00_RENCANA_PELAKSANAAN.md`  
**Versi**: 1.0.0 (Master Blueprint)  
**Tanggal**: 2026-11-08  
**Penyusun**: Worker M1 & Tim Arsitektur  

---

## 1. Pendahuluan dan Ringkasan Eksekutif

Aplikasi **PutarTopik** adalah platform interaktif untuk ideasi topik presentasi dadakan (*impromptu speaking*) dan latihan panggung terstruktur bagi pembicara publik, fasilitator lokakarya, dan profesional produk. 

Proyek ini bertujuan melakukan perancangan ulang (*rebuild*) menyeluruh terhadap implementasi referensi monolitik (`putartopik_vertical_presentation_spinner_timer.tsx`, 1.358 baris) menjadi aplikasi web modern berbasis Next.js (App Router), React, TypeScript, dan Tailwind CSS. Tampilan visual mengadopsi estetika berkelas tinggi dari template Webflow Catalis (`[Referensi]Catalis Website Page Template for Webflow.jpg`) serta sistem tata letak matematis dari `notion-DESIGN.md`, dengan kepatuhan penuh terhadap standar kecerdasan buatan anti-slop (*AI-antislop rules*).

---

## 2. Analisis Kebutuhan dan Ruang Lingkup Fungsional

Berdasarkan ekstraksi fitur mendalam pada berkas referensi (`putartopik_vertical_presentation_spinner_timer.tsx`), aplikasi ini mencakup 33 fitur inti yang dikelompokkan dalam 6 domain:

### 2.1 Navigasi Panggung & Kontrol Mode
- **F01**: *Top Bar Navigation* dengan logo mark monogram "PT", indikator jumlah judul aktif, tombol mute/unmute audio, dan pengalih mode panggung.
- **F02**: *Dual Mode Stage Switcher* berbentuk pil tersegmentasi antara mode pemutar topik vertikal (`SPIN`) dan mode jam hitung mundur panggung (`TIMER`).
- **F03**: *Primary Action Cluster* yang menampilkan tombol aksi kontekstual ("Putar Ide" dengan lencana panah sirkular, "Buka Timer", "Mulai Timer", "Jeda", "Reset", dan "Selesai & Arsipkan").

### 2.2 Fisika Pemutar Topik Vertikal (*Vertical Drum Reel*)
- **F04**: *Vertical Slot Drum Viewport* setinggi 288px yang menampilkan 3 baris judul (`ITEM_HEIGHT = 96px`) dengan bilah sorot tengah (*center highlight frame*) beraksen hijau limau 15% opacity dan detent penahan ganda.
- **F05**: *Quintic Ease-Out Animation Loop* selama 6,5 detik menggunakan `requestAnimationFrame` dengan rumus deselerasi $1 - (1 - \text{progress})^{4.5}$ yang mencakup fase lesatan cepat (0–2s), perlambatan (2–4,3s), dan pergerakan dramatis lambat pada 5 item terakhir (4,3–6,5s).
- **F06**: *Reel Sequence Generation* yang menghasilkan 54 kartu topik dengan jaminan pencegahan duplikasi item berturutan serta penjaminan item sebelum pemenang selalu berbeda untuk memberikan efek ketegangan (*suspense*).
- **F07**: *Topic Lock/Unlock* untuk mengunci judul terpilih agar tidak sengaja terputar ulang saat sesi latihan berlangsung.

### 2.3 Sintesis Audio Prosedural (Web Audio API)
- **F08**: *Apple Detent Scroll Tick* yang mensintesis bunyi klik mekanis digital crown secara prosedural (gelombang segitiga 1350Hz–1700Hz menyapu ke 290Hz dipadu semburan noise bandpass 2600Hz) setiap kali slot berputar melewati indikator tengah.
- **F09**: *Lock-in Chime* yang membunyikan akor dua nada sinus naik yang jernih: nada D5 (587,33 Hz) diikuti nada A5 (880,00 Hz) dengan jeda 65 milidetik saat topik pemenang berhenti tepat di tengah.
- **F10**: *Zero External Audio Assets* tanpa memuat berkas audio eksternal (MP3/WAV), menjamin latensi instan dan keandalan luring penuh.
- **F11**: *Autoplay Resume & Mute Guard* yang menangani kebijakan suspensi AudioContext peramban secara anggun pada interaksi pertama pengguna.

### 2.4 Mesin Timer Panggung & Sinyal Dinamis
- **F12**: *Giant Tabular Clock Display* dengan tipografi responsif fluida (`clamp(3.5rem, 14vw, 10.5rem)`) menggunakan angka tabular (`tabular-nums`) bebas getar (*layout jiggle*).
- **F13**: *Dynamic 6-Phase Stage Signals* yang menghitung status fase latihan secara otomatis:
  1. "Siap Mulai" (abu-abu netral)
  2. "Fase Awal" (biru aksen)
  3. "50% Durasi Tercapai" (hijau zamrud)
  4. "Sisa 30 Detik" (kuning jingga)
  5. "Sisa 10 Detik" (merah peringatan)
  6. "Lewat Waktu" (merah pekat dengan tanda `+`)
- **F14**: *Preset Duration Cards* dengan 4 kartu durasi cepat: Kilat (60s), Standar (120s), Mendalam (180s), dan Presentasi (300s).
- **F15**: *Custom Minute Input* yang memvalidasi durasi kustom antara 1 hingga 120 menit dengan pembulatan detik akurat.
- **F16**: *Overtime Tracking Engine* yang menghitung detik lewat waktu tanpa henti dengan tanda awalan `+` (misal: `+00:00:15`).
- **F17**: *Surprise Curveball Alert (Selaan 45 Detik)* yang menyuntikkan pertanyaan kejutan atau tantangan kata dadakan tepat pada sisa 45 detik durasi bicara.

### 2.5 Catatan Isyarat Bicara (*Speaker Cue Notes*)
- **F18**: *3-Point Cue Notes Bar* (01 Pembuka, 02 Poin Inti, 03 Penutup) di bawah kartu durasi.
- **F19**: *5-Word Token Cap Enforcement* melalui algoritma `capFiveWords` yang secara ketat membatasi setiap poin maksimal 5 kata untuk membiasakan pembicara membuat poin ringkas alih-alih membaca naskah.

### 2.6 Ruang Kerja Bento & Manajemen Data Lokal
- **F20**: *Topic Queue Card* dengan gradasi biru langit Catalis yang mendukung input judul tunggal dan tempel masal (*bulk import* multi-baris).
- **F21**: *Session Analytics Card* yang menyajikan metrik tingkat ketepatan waktu (*on-time completion rate*) dan rata-rata durasi bicara serta log riwayat sesi.
- **F22**: *Challenge Constraints Card* berwarna hijau limau terang untuk memasangkan batasan metodologi presentasi (misal: metode PREP, analogi benda, batasan pembuka 20 detik).
- **F23**: *Archived Topics Card* berwarna tinta obsidian gelap untuk menampung topik yang telah dipresentasikan dan mendukung pemulihan masal.
- **F24**: *LocalStorage Persistence Engine* di bawah kunci `putartopik_nextjs_v1` dengan proteksi hidrasi SSR Next.js.

---

## 3. Pedoman Desain Visual & Rekonsiliasi Anti-Slop

### 3.1 Sintesis Estetika Catalis
Desain visual dibangun di atas prinsip kemewahan editorial teknologi modern Catalis:
- **Kanvas Utama**: Putih bersih murni (`#FFFFFF`) dipadu latar panggung abu-abu netral lembut (`#F4F5F7`).
- **Warna Identitas Catalis**: Biru langit atmosferik (`#0B69B7` hingga `#248BE0`) pada kartu input antrean topik.
- **Aksen Keterlihatan Tinggi**: Hijau limau elektrik (*electric lime* `#C6FF33`) untuk tombol aksi utama "Putar Ide", bingkai indikator putaran, dan kartu tantangan.
- **Jangkar Kontras Gelap**: Tinta obsidian pekat (`#0D1117`) untuk tipografi judul, tombol timer sekunder, dan kartu arsip.

### 3.2 Matriks Rekonsiliasi Aturan (notion-DESIGN vs Catalis vs Anti-Slop)

Sesuai instruksi penugasan, ketika terjadi perbedaan antara `notion-DESIGN.md`, gaya Catalis, dan aturan *AI-antislop*, aturan **AI-antislop wajib diprioritaskan**:

| Aspek | Spesifikasi notion-DESIGN | Spesifikasi Catalis | Standar AI-Antislop | Keputusan Final Terpilih |
|---|---|---|---|---|
| **Palet Warna** | Ungu Notion `#5645d4` & Navy `#0a1530` | Biru Langit `#0B69B7`, Limau `#C6FF33`, Tinta `#0D1117` | Maksimal 2 peran warna inti + 1 aksen. Hindari meniru Linear/Notion tanpa alasan. | **Prioritas Catalis & Antislop**: Gunakan palet Catalis (Biru Langit, Hijau Limau, Hitam Tinta). Tolak warna ungu/navy Notion. |
| **Kontras Teks pada Limau** | Tidak didefinisikan. | Teks gelap di atas tombol limau. | Teks di atas warna terang wajib mencapai rasio kontras >= 4.5:1 (R-25). Teks putih di atas limau adalah kegagalan fatal (1.18:1). | **Prioritas Mutlak Antislop**: Semua teks dan ikon di atas `#C6FF33` wajib menggunakan hitam tinta `#0D1117` (rasio kontras 16.00:1, lolos AAA). Teks putih dilarang keras. |
| **Ukuran Target Sentuh** | Tombol 38px tinggi; tab 32px tinggi. | Tombol pil standar. | Semua target interaktif wajib memiliki tinggi/lebar minimal 44x44px untuk aksesibilitas jemari (R-03). | **Prioritas Mutlak Antislop**: Semua tombol, tab switch, input field, dan ikon aksi memiliki area sentuh minimum 44px (`min-h-[44px]`, `min-w-[44px]`). |
| **Hierarki Sudut (Border Radius)** | Radius seragam 8px (`rounded-md`) di semua tombol ("bukan pil"). | Tombol pil (`rounded-full`) dan kartu sudut besar 24–28px. | Dilarang membuat semua elemen berbentuk pil atau semua seragam kotak (R-11). Variasi radius adalah alat hierarki visual. | **Prioritas Antislop & Catalis**: Hierarki bertingkat: Tombol aksi utama & switch = `rounded-full`; Kartu bento = `rounded-[24px]`; Panggung utama = `rounded-[28px]`; Input = `rounded-xl` (12px); Lencana = `rounded-sm` (4px). |
| **Karakter Tipografi** | Menggunakan em dash (`—`) dalam teks deskripsi. | Teks judul dengan tanda pisah. | Larangan ketat penggunaan tanda em dash (`—`) pada seluruh antarmuka dan label (R-02). | **Prioritas Mutlak Antislop**: Dilarang menggunakan em dash (`—`). Ganti dengan tanda titik dua, tanda kurung, atau titik. |
| **Tata Letak Responsif** | Grid 4 kolom dan 3 kolom kaku berbasis desktop. | Tampilan bento fleksibel. | Tampilan wajib mengalir alami ke 1 kolom pada ponsel (<768px) tanpa luapan horizontal (R-03). | **Prioritas Antislop**: Grid bento runtuh ke 1 kolom pada layar kecil; kartu durasi beralih ke 2x2 pada tablet/ponsel. |

---

## 4. Arsitektur Perangkat Lunak dan Struktur Komponen

### 4.1 Dekomposisi Custom Hooks
Untuk menghindari kopling monolitik, logika aplikasi dipisahkan ke dalam 5 custom hooks independen:
1. **`useAudioEngine`**: Mengelola siklus hidup `AudioContext`, penguraian suspensi peramban, status mute, dan sintesis prosedural nada detent serta chimes.
2. **`useSpinnerReel`**: Mengelola fisika putaran drum vertikal, pembangkitan deret 54 kartu acak, animasi RAF 6,5 detik quintic ease-out, pemicu audio detent per slot, dan penguncian hasil.
3. **`usePresentationTimer`**: Mengatur interval hitung mundur 1 detik, perhitungan waktu lewat waktu (*overtime*), penentuan sinyal 6-fase panggung, dan pemicu selaan kejutan 45 detik.
4. **`useTopicStorage`**: Mengatur hidrasi dan sinkronisasi `localStorage` dengan kunci `putartopik_nextjs_v1`, operasi CRUD judul, arsip, tantangan metodologi, dan riwayat sesi.
5. **`useCueNotes`**: Mengatur 3 poin isyarat pembicara dengan pemaksaan batas 5 kata melalui fungsi tokenisasi `capFiveWords`.

### 4.2 Dekomposisi Komponen UI
- `components/layout/Navbar.tsx`: Monogram logo PT, counter judul aktif, sound toggle, mode switcher.
- `components/stage/StageContainer.tsx`: Wadah panggung utama dengan sudut 28px (`rounded-[28px]`).
- `components/stage/SpinReel.tsx`: Slot drum vertikal 3 baris dengan bilah penanda limau tengah.
- `components/stage/GiantClock.tsx`: Tampilan jam digital raksasa responsif dengan angka tabular.
- `components/stage/StageSignalBadge.tsx`: Lencana pil status 6-fase berstandar kontras WCAG AA.
- `components/stage/TopicActionBar.tsx`: Kluster tombol aksi utama dengan lencana sirkular.
- `components/stage/DurationCards.tsx`: 4 kartu pilihan durasi latihan.
- `components/stage/StageFooterBar.tsx`: 3 input isyarat pembicara, checkbox selaan 45d, dan input menit kustom.
- `components/workspace/TopicInputCard.tsx`: Kartu bento gradasi biru langit untuk antrean judul.
- `components/workspace/StatsHistoryCard.tsx`: Kartu bento analitik latihan dan log riwayat.
- `components/workspace/ConstraintsCard.tsx`: Kartu bento hijau limau untuk aturan tantangan bicara.
- `components/workspace/ArchiveCard.tsx`: Kartu bento tinta hitam untuk arsip judul selesai.
- `components/ui/Toast.tsx`: Notifikasi mengambang otomatis hilang dalam 3 detik.

---

## 5. Strategi Pengujian Otomatis E2E 4-Tier Playwright

Untuk menjamin kualitas perangkat lunak tanpa kompromi, aplikasi akan diverifikasi oleh pekerja khusus (*Worker E2E*) menggunakan rangkaian uji Playwright yang mencakup 116 kasus uji dalam 4 tier:

### 5.1 Tier 1: Cakupan Fitur Inti (12 Berkas Uji, 71 Kasus Uji)
- `t1-01-navigation.spec.ts` (6 tes): Verifikasi logo, tautan anchor panggung, pengalih mode, dan counter.
- `t1-02-audio-engine.spec.ts` (5 tes): Verifikasi inisialisasi AudioContext, status mute/unmute, dan persistensi suara.
- `t1-03-spinner-reel.spec.ts` (6 tes): Verifikasi rotasi drum vertikal, durasi 6,5 detik, dan penguncian pemenang.
- `t1-04-topic-lock.spec.ts` (5 tes): Verifikasi pencegahan putar ulang saat terkunci dan fungsi buka kunci.
- `t1-05-timer-clock.spec.ts` (6 tes): Verifikasi akurasi interval hitung mundur, jeda, lanjut, dan reset.
- `t1-06-stage-signals.spec.ts` (6 tes): Verifikasi perubahan warna dan teks lencana pada setiap milestone 6-fase.
- `t1-07-duration-presets.spec.ts` (6 tes): Verifikasi pergantian durasi 60s, 120s, 180s, 300s, dan status aktif.
- `t1-08-custom-duration.spec.ts` (5 tes): Verifikasi input kustom 1–120 menit dan penolakan nilai tak valid.
- `t1-09-speaker-cues.spec.ts` (6 tes): Verifikasi pemaksaan batas maksimal 5 kata dan counter `X/5`.
- `t1-10-curveball-prompt.spec.ts` (5 tes): Verifikasi kemunculan banner tantangan tepat pada sisa 45 detik.
- `t1-11-topic-crud.spec.ts` (8 tes): Verifikasi tambah tunggal, tempel masal, arsip manual, dan hapus judul.
- `t1-12-constraints-archive.spec.ts` (7 tes): Verifikasi tambah/hapus aturan tantangan, pemulihan arsip masal, dan riwayat.

### 5.2 Tier 2: Batas Sistem & Kondisi Ekstrem (6 Berkas Uji, 30 Kasus Uji)
- `t2-01-empty-states.spec.ts` (5 tes): Uji coba tombol putar saat antrean kosong, arsip kosong, atau riwayat kosong.
- `t2-02-single-item.spec.ts` (5 tes): Uji coba putaran saat hanya terdapat tepat 1 judul dalam antrean.
- `t2-03-input-limits.spec.ts` (5 tes): Uji coba penolakan duplikasi judul, teks kosong, dan spasi berlebih.
- `t2-04-constraint-safeguards.spec.ts` (5 tes): Uji coba proteksi pencegahan penghapusan aturan tantangan terakhir (minimal 1).
- `t2-05-overtime-counter.spec.ts` (5 tes): Uji coba ketepatan tanda awalan `+` saat waktu latihan terlewati.
- `t2-06-storage-resilience.spec.ts` (5 tes): Uji coba pemulihan otomatis saat data localStorage rusak atau tidak valid.

### 5.3 Tier 3: Kombinasi Lintas Fitur (1 Berkas Uji, 10 Kasus Uji)
- `t3-01-cross-feature.spec.ts` (10 skenario):
  1. Putar topik -> beralih ke timer -> jalankan latihan -> selesaikan & arsipkan -> cek riwayat.
  2. Modifikasi durasi kustom -> aktifkan selaan -> selesaikan tepat waktu -> cek persentase on-time.
  3. Kunci topik -> coba putar (harus gagal) -> buka kunci -> putar ulang berhasil.
  4. Tempel masal 10 judul -> putar berkali-kali -> arsipkan separuh -> pulihkan semua arsip.
  5. Isi 3 poin isyarat -> selesaikan sesi -> verifikasi catatan tereset otomatis.

### 5.4 Tier 4: Simulasi Rehearsal Panggung Nyata (1 Berkas Uji, 5 Skenario)
- `t4-01-real-world.spec.ts` (5 skenario alur kerja lengkap):
  1. *Sesi Kilat Pembicara Baru*: Rehearsal 60 detik dengan metode PREP.
  2. *Sesi Standar dengan Interupsi Selaan*: Rehearsal 120 detik, respons pertanyaan sela pada detik ke-45.
  3. *Sesi Melebihi Waktu (Overtime)*: Rehearsal yang disengaja melewati batas waktu untuk memverifikasi pencatatan overtime di log riwayat.
  4. *Siklus Manajemen Konten*: Input 5 topik presentasi baru, modifikasi aturan tantangan, dan verifikasi analitik.
  5. *Uji Ketahanan Muat Ulang Halaman*: Verifikasi persistensi penuh setelah reload peramban di tengah alur kerja.

---

## 6. Rencana Pelaksanaan Bertahap (Milestones)

Proyek ini dilaksanakan melalui 7 tonggak capaian (*milestones*):

| Milestone | Nama & Fokus | Lingkup Utama | Target Hasil |
|---|---|---|---|
| **M1** | Fondasi, Scaffolding & Rencana | Setup Next.js, TypeScript, Tailwind, token Catalis, types/constants, rencana `laporan/00` & `01`. | Build `npm run build` berhasil dengan nol galat. |
| **M2** | Domain Hooks & Mesin Logika | Implementasi `useAudioEngine`, `useSpinnerReel`, `usePresentationTimer`, `useTopicStorage`, `useCueNotes`. | Logika unit dan sintesis Web Audio siap pakai. |
| **M3** | Antarmuka Panggung & Bento | Implementasi Navbar, StageContainer, SpinReel, GiantClock, StageControls, dan 3 kartu Bento. | Halaman utama interaktif penuh sesuai desain Catalis. |
| **M4** | Modal, Laci & Penyempurnaan | Fitur bulk add, laci arsip, manajemen tantangan, dan pengaturan selaan. | Seluruh interaksi fungsional selesai 100%. |
| **M5** | Integrasi & Verifikasi Build | Pengecekan build produksi Next.js, audit gesture audio, dan laporan kemajuan `laporan/02`. | Bebas galat kompilasi dan peringatan lint. |
| **M-E2E** | Pengujian Otomatis E2E | Setup Playwright, Page Object Model, eksekusi 116 kasus uji pada website aktif. | 116/116 tes lulus (100% pass rate). |
| **M-FINAL**| Audit Forensik & Serah Terima | Audit integritas oleh teamwork_auditor, dokumentasi akhir di `laporan/03` & `04`. | Persetujuan serah terima produksi. |

---

## 7. Matriks Kepatuhan Anti-Slop (R-01 hingga R-40)

Seluruh implementasi diawasi ketat oleh kriteria kualitas berikut:
- **R-02 (Larangan Em Dash)**: Nol karakter em dash (`—`) di seluruh berkas kode, antarmuka, dan dokumentasi.
- **R-03 (Responsivitas Mobile)**: Tipografi dinamis fluida (`clamp`), target sentuh minimum 44px, dan nol overflow horizontal.
- **R-11 (Hierarki Radius)**: Kombinasi proporsional antara tombol pil (aksi utama), radius 24–28px (kartu/panggung), dan 12px (input).
- **R-25 (Kontras Warna WCAG AA/AAA)**: Teks gelap di atas hijau limau (16.00:1), teks putih di atas biru langit (5.65:1), dan teks slate gelap di atas permukaan abu-abu (5.86:1).
- **R-26 & R-27 (Interaktivitas & State UI)**: Setiap kontrol memiliki aksi nyata, penanganan status kosong (*empty states*), dan umpan balik toast.
- **R-32 (Aksesibilitas Keyboard)**: Cincin fokus kontras tinggi `:focus-visible` pada seluruh tombol dan tautan.
- **R-39 (Afodansi Interaktif)**: `cursor: pointer` pada semua elemen klik dan `cursor: not-allowed` pada elemen dinonaktifkan.

---

## 8. Kesimpulan

Rencana pelaksanaan ini memberikan landasan arsitektur yang kokoh, rinci, dan terverifikasi untuk membangun kembali aplikasi PutarTopik ke standar produksi tertinggi yang memadukan keindahan visual Catalis, kekuatan Next.js, dan keandalan pengujian otomatis Playwright.
