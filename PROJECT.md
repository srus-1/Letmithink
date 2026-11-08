# Project: letmithink

## Design Read & Decisions (R-31 & Three Dials)
- **Design Read**: A stage rehearsal tool (`letmithink`) for speakers who need an instant, zero-friction topic randomizer and readable countdown clock in a single unified frame above the fold.
- **Three Dials**: `ENERGY 3 (High-Contrast Stage Focus)` · `RHYTHM 2 (Single-Frame Stage + Aligned 3-Column Bento)` · `MOTION 2 (Functional Reel Physics + Reduced-Motion Safe)`
- **Color Palette (Strictly Locked to 60:30:10 Hierarchy)**:
  - **60% Primer — Putih (`#FFFFFF` canvas / `#F4F5F7` surface)**: Page background, navbar, main Stage container (`SlotReel`, `TimerClock`, `CueNotesBar`), and inner card list panels.
  - **30% Sekunder — Hitam (`#0D1117` / `#000000` ink)**: The 3 main Bento cards (`TopicQueueCard`, `ConstraintCard`, `StatsCard`), secondary `Buka Timer` CTA, and active preset card.
  - **10% Aksesoris — Kuning Stabilo (`#C6FF33` / `#B5F01E` accent lime)**: Primary `Putar Ide` CTA, the compact `ArchiveCard` at the bottom-right, the small `Tantangan aktif saat ini` highlight box inside `ConstraintCard`, the small `Tepat Waktu` KPI box inside `StatsCard`, and count/action badges.
- **Typography**: Single-family `Inter` (`--font-inter`) across all UI and numeric displays (`tabular-nums`), using `font-semibold` (600) for headings and timers, `font-medium` (500) for interactive buttons and tabs, and `font-normal` (400) for body copy and labels.
- **Layout & 100vh Single-Frame Stage Hierarchy**:
  - The Spin/Timer frame (`#panggung-utama`) spans the `100vh` landing viewport (`min-h-[calc(100vh-84px)]`) containing ONLY the Fullscreen icon-only button (`Maximize2`/`Minimize2`, `data-testid="fullscreen-btn"`) at its top-right corner, the `SlotReel` or `TimerClock` (with `"Siap diacak"`, `"10 topik dalam antrean"`, and the bottom divider line removed), and the `Putar Ide` / `Buka Timer` action buttons directly below it inside the same frame.
  - Below the `100vh` stage frame with explicit vertical rhythm sits the **4-Column Timer Duration Selector** (`mt-6`, `1 Menit`, `2 Menit`, `3 Menit`, and `Atur Sendiri` with `w-20 px-2.5 text-center` input so `"Menit"` is never clipped), followed by `CueNotesBar` (`mt-8 mb-10`) and the asymmetric 12-column `BentoGrid` (`mt-12 pt-10 border-t border-slate-200/80`, `gap-6 lg:gap-8`).
- **Bottom Workspace Architecture (Asymmetric 12-Column Grid, `p-6 sm:p-7 rounded-[28px]`, & Anti-Clipping)**:
  - `BentoGrid` uses an asymmetric `grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch` prioritized for eye-tracking:
    - **Left Column (`lg:col-span-5` — `TopicQueueCard`)**: Primary dark `#0D1117` surface (`p-6 sm:p-7 rounded-[28px]`) with `mb-3 pb-2 border-b border-white/10 bg-[#0D1117]` header, `pt-2 pb-4 px-1` scroll padding, hover-revealed `Arsipkan` text button + `×` delete button, and a collapsed compact archive footer bar (`{count} diarsipkan · Kembalikan semua`).
    - **Middle Column (`lg:col-span-4` — `ConstraintCard`)**: Neutral `#F4F5F7` (`border-slate-200`, `p-6 sm:p-7 rounded-[28px]`) surface with `mb-3 pb-2 border-b border-slate-200 bg-[#F4F5F7]` list header, `pt-2 pb-4 px-1` scroll padding, `line-clamp-2 leading-snug` rules, and state-consistent banner (`Tantangan dinonaktifkan untuk sesi ini` with `opacity-50 bg-slate-200 text-slate-500` when toggled to `Mati`).
    - **Right Column (`lg:col-span-3` — `StatsCard`)**: Neutral `#F4F5F7` (`border-slate-200`, `p-6 sm:p-7 rounded-[28px]`) surface with a `grid-cols-2 gap-3` layout (`Total Sesi` + `Tepat Waktu` side by side, and full-width `col-span-2` `Rata-rata Durasi` bar below), uniform `bg-white border-slate-200/80` surfaces when `totalSessions === 0`, a balanced `min-h-[240px]` session history container, and honest session metrics (`Sesi Tes (<15d)` excluded from `onTimeRate`).
- **Spacing & Radii**: Consistent `max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8` container, `rounded-xl` (12px) for cards/containers, and `rounded-lg` (8px) for buttons/inputs.
- **Icons**: Lucide React functional icons (`Shuffle`, `Timer`, `Zap`, `Archive`, `Sliders`, `Maximize2`, `Minimize2`) with `aria-hidden="true"` and zero decorative sparkle fluff.

## Architecture
- **Framework**: Next.js (App Router, React 18/19, TypeScript)
- **Styling**: Tailwind CSS + PostCSS, styled after Catalis Webflow template (`[Referensi]Catalis Website Page Template for Webflow.jpg`), layout rules from `notion-DESIGN.md`, strictly prioritized by AI-antislop rules (`antislop`, `antislop-ui`, `antislop-human`, `antislop-layoutmobile`, `antislop-copywriting`).
- **Icons**: Lucide React
- **Audio**: Native Web Audio API procedural synthesis (Apple haptic detent scroll tick & D5/A5 chime, zero audio assets).
- **State & Kinematics**: Decoupled custom hooks (`useAudioEngine`, `useSpinnerReel`, `usePresentationTimer`, `useTopicStorage`, `useCueNotes`).
- **E2E Testing**: Dedicated Playwright automation suite (116 tests across Tiers 1-4) testing live site with zero failures.
- **Reporting & Documentation**: Complete plans and progress logs maintained in `laporan/`.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| F01 | Vertical Drum Reel Physics | 3-item window, 96px item height, 54 sequence items, 4992px travel, 6.5s quintic ease-out | M2 | Survey 1 |
| F02 | Audio Detent Tick Synthesis | Procedural triangle sweep (1350Hz->290Hz) + 2600Hz bandpassed noise click | M2 | Survey 1 |
| F03 | Audio Lock Chime Synthesis | Dual sine tones: D5 (587.33Hz) + A5 (880Hz) staggered 65ms upon spin completion | M2 | Survey 1 |
| F04 | Audio Toggle Control | Mute/unmute state persisted to localStorage, indicator icon, disables sound when muted | M2 | Survey 1 |
| F05 | Presentation Timer Engine | 1000ms interval, elapsed seconds, remaining seconds, overtime counter with `+` prefix | M2 | Survey 1 |
| F06 | Preset Duration Selector | 4 cards: Kilat (60s), Standar (120s), Mendalam (180s), Presentasi (300s) | M3 | Survey 1 |
| F07 | Custom Duration Input | 1-120 minutes input field with validation, clamping, and error feedback | M3 | Survey 1 |
| F08 | Dynamic Stage Signals | 6-phase status badge (Siap Mulai, Fase Awal, 50% Tercapai, Sisa 30s, Sisa 10s, Lewat Waktu) | M2 | Survey 1 |
| F09 | Curveball Prompt Alert | Randomized mid-presentation challenge injected at exactly 45s remaining when enabled | M4 | Survey 1 |
| F10 | Curveball Toggle Setting | Enable/disable curveball injections, persisted in settings | M4 | Survey 1 |
| F11 | Stage Mode Switcher | Pill-shaped toggle between "Putar Ide" (SPIN) and "Timer Panggung" (TIMER) | M3 | Survey 1 |
| F12 | Primary Action Cluster | Action buttons: "Putar Ide", "Buka Timer", "Mulai", "Jeda", "Reset", "Selesai & Arsipkan" | M3 | Survey 1 |
| F13 | Giant Tabular Clock | Fluid responsive display (`clamp`) with tabular numbers, dynamic color by phase | M3 | Survey 1 |
| F14 | 3-Point Cue Notes Bar | 3 structured speaker cue inputs (Pembuka, Poin Inti, Penutup/Call to Action) | M3 | Survey 1 |
| F15 | 5-Word Cue Cap Enforcement | Automatic tokenization capping each cue input to maximum 5 words with feedback | M2 | Survey 1 |
| F16 | Topic Queue Bento Card | Sky blue card displaying active queue list, item count, selection badge, and quick actions | M3 | Survey 1 |
| F17 | Single Topic Add | Input field with duplicate check, whitespace trimming, and keyboard enter support | M4 | Survey 1 |
| F18 | Bulk Topic Import Modal | Multi-line textarea for bulk paste, blank line filtering, deduplication | M4 | Survey 1 |
| F19 | Manual Topic Archival | Move active topic to archived array with timestamp | M4 | Survey 1 |
| F20 | Topic Deletion Safeguard | Delete active topic with confirmation or minimum array guard | M4 | Survey 1 |
| F21 | Archive Drawer & Restore | View archived topics history, restore individual topic, or restore all archived | M4 | Survey 1 |
| F22 | Speech Constraint Card | Bento card displaying active presentation methodology constraint | M3 | Survey 1 |
| F23 | Constraint Randomizer | "Ganti Kendala" button shuffling active speech methodology constraint | M4 | Survey 1 |
| F24 | Constraint Management Modal | Add custom constraint, view constraints list, delete with >=1 remaining safeguard | M4 | Survey 1 |
| F25 | Presentation Stats Bento | Bento card showing total speeches, on-time percentage rate, average duration in seconds | M3 | Survey 1 |
| F26 | LocalStorage Persistence | Key `putartopik_nextjs_v1` saving titles, archived, constraints, history, settings | M2 | Survey 1 |
| F27 | Reset to Default Data | Settings option to reset all datasets back to default values | M4 | Survey 1 |
| F28 | Catalis Visual Theme | Atmospheric sky blue header, electric lime accents, dark ink contrast, surface gray | M1 | Survey 2 |
| F29 | WCAG 2.1 Contrast AA/AAA | Verified text contrast (16:1 on lime, 5.6:1 on sky blue, 5.8:1 on surface) | M1 | Survey 2 |
| F30 | 44px Minimum Tap Targets | All buttons, tabs, inputs, and toggles have >=44x44px hitboxes | M1 | Survey 2 |
| F31 | Responsive Mobile Reflow | 12-col bento collapses to 1-col on mobile (<768px), fluid typography, zero overflow | M1 | Survey 2 |
| F32 | Zero Em Dash Ban (R-02) | Clean Indonesian UI copy without generic AI buzzwords or em dashes | M1 | Survey 2 |
| F33 | Playwright E2E Test Suite | 116 tests across 4 tiers executed against live running application | M-E2E | Survey 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundation & Antislop Design | Next.js setup, Tailwind tokens, layout rules, antislop styling, `laporan/` setup | None | PLANNED |
| M2 | Domain Hooks & State Core | Audio synthesis, spinner kinematics, timer intervals, persistence, cue cap | M1 | PLANNED |
| M3 | Core UI & Stage Rebuild | Header, hero stage, slot reel, clock, controls, cues, bento cards | M1, M2 | PLANNED |
| M4 | Modals, Drawers & Constraints | Bulk add, single add, archive drawer, constraint modal, settings | M2, M3 | PLANNED |
| M5 | Build & Integration Polish | Build verification (`next build`), audio gesture check, `laporan/` updates | M1-M4 | PLANNED |
| M-E2E | E2E Testing Suite & Execution | Playwright config, 116 tests across Tiers 1-4, test execution report | M1, M3 | PLANNED |
| M-FINAL | Acceptance & Forensic Audit | 100% E2E test pass, forensic audit verification, final human report | M5, M-E2E | PLANNED |

## Interface Contracts
### `useAudioEngine`
- `playDetentClick(progress: number): void`
- `playLockChime(): void`
- `soundEnabled: boolean`
- `setSoundEnabled(enabled: boolean): void`
- `initAudio(): Promise<void>`

### `useSpinnerReel`
- `isSpinning: boolean`
- `reelSequence: string[]`
- `translateY: number`
- `selectedIndex: number`
- `spin(titles: string[], onComplete: (selected: string) => void): void`

### `usePresentationTimer`
- `timerState: "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED"`
- `elapsedSec: number`
- `targetSec: number`
- `remainingSec: number`
- `isOvertime: boolean`
- `stageSignal: { label: string; color: string; badgeBg: string }`
- `start(): void`
- `pause(): void`
- `reset(): void`
- `setDuration(seconds: number): void`

### `useTopicStorage`
- `titles: string[]`
- `archived: ArchivedTopic[]`
- `activeTitle: string`
- `constraints: string[]`
- `activeConstraint: string`
- `history: SessionRecord[]`
- `settings: AppSettings`
- `addTitle(title: string): boolean`
- `addBulk(titles: string[]): number`
- `archiveActive(): void`
- `restoreArchived(id: string): void`
- `restoreAll(): void`
- `deleteActive(): void`
- `shuffleConstraint(): void`

## Code Layout
```
/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── stage/
│   │   ├── StageContainer.tsx
│   │   ├── SlotReel.tsx
│   │   ├── TimerClock.tsx
│   │   ├── StageControls.tsx
│   │   └── CueNotesBar.tsx
│   ├── workspace/
│   │   ├── BentoGrid.tsx
│   │   ├── TopicQueueCard.tsx
│   │   ├── ConstraintCard.tsx
│   │   └── StatsCard.tsx
│   │   └── ArchiveCard.tsx
│   └── modals/
│       ├── BulkAddModal.tsx
│       ├── ConstraintModal.tsx
│       ├── ArchiveDrawer.tsx
│       └── SettingsModal.tsx
├── hooks/
│   ├── useAudioEngine.ts
│   ├── useSpinnerReel.ts
│   ├── usePresentationTimer.ts
│   ├── useTopicStorage.ts
│   └── useCueNotes.ts
├── lib/
│   ├── audio.ts
│   ├── constants.ts
│   ├── storage.ts
│   └── types.ts
├── tests/
│   ├── e2e/
│   │   ├── tier1-features/
│   │   ├── tier2-boundaries/
│   │   ├── tier3-cross-feature/
│   │   └── tier4-real-world/
│   └── page-objects/
│       └── PresentationPage.ts
├── laporan/
│   ├── 00_RENCANA_PELAKSANAAN.md
│   ├── 01_PROGRESS_ARSITEKTUR_DAN_SETUP.md
│   ├── 02_PROGRESS_KOMPONEN_DAN_FITUR.md
│   ├── 03_PROGRESS_E2E_DAN_VERIFIKASI.md
│   └── 04_LAPORAN_AKHIR_DAN_VERIFIKASI.md
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```
