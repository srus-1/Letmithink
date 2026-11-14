import { DurationCard } from "./types";

export const STORAGE_KEY = "putartopik_nextjs_v1";

export const ITEM_HEIGHT = 96;
export const SPIN_DURATION_MS = 6500;
export const TOTAL_SPIN_ITEMS = 54;
export const REEL_VIEWPORT_HEIGHT = 288; // 3 visible rows * 96px slot height
export const DEFAULT_TARGET_SEC = 120;
export const CURVEBALL_TRIGGER_SEC = 45;

export const DEFAULT_TITLES: string[] = [
  "Strategi Efisiensi Biaya Cloud Tanpa Mengorbankan Performa",
  "Dampak Kerja Jarak Jauh terhadap Produktivitas Tim Produk",
  "Penerapan Sistem Desain Terpusat untuk Mempercepat Rilis Fitur",
  "Mengapa Banyak Proyek Transformasi Digital Gagal di Tahun Pertama",
  "Cara Menyusun Peta Jalan Produk saat Prioritas Bisnis Berubah Cepat",
  "Arsitektur Frontend Modern: Kapan Harus Memilih Render di Server",
  "Membangun Budaya Evaluasi Tanpa Menyalahkan Individu di Tim Teknis",
  "Optimasi Alur Pendaftaran Pengguna untuk Menekan Angka Batal Daftar",
];

export const DEFAULT_CONSTRAINTS: string[] = [
  "Gunakan kerangka PREP: Poin utama, Alasan, Contoh nyata, dan Penutup",
  "Buka presentasi dengan cerita pengalaman nyata maksimal 20 detik",
  "Ambil sudut pandang kritis terhadap solusi yang paling populer",
  "Jelaskan konsep inti menggunakan satu analogi benda sehari-hari",
  "Tutup presentasi dengan satu ajakan bertindak yang terukur",
];

export const CURVEBALL_PROMPTS: string[] = [
  "Pertanyaan sela: Bagaimana jika anggaran proyek ini dipangkas separuh?",
  "Pertanyaan sela: Apa risiko terbesar jika rencana ini ditunda 6 bulan?",
  "Tantangan kata: Selipkan kata 'jangkar' secara alami di kalimat berikutnya.",
  "Tantangan kata: Selipkan kata 'jembatan' secara alami di kalimat berikutnya.",
  "Pertanyaan sela: Metrik tunggal apa yang membuktikan solusi ini berhasil?",
];

export const DURATION_CARDS: DurationCard[] = [
  { id: "1m", label: "1 Menit", tag: "Kilat", sec: 60, display: "01:00" },
  { id: "2m", label: "2 Menit", tag: "Standar", sec: 120, display: "02:00" },
  { id: "3m", label: "3 Menit", tag: "Mendalam", sec: 180, display: "03:00" },
];

export const DURATION_PRESETS = DURATION_CARDS;
