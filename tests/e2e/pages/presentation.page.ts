import { Page, Locator, expect } from "@playwright/test";

export class PresentationPage {
  readonly page: Page;

  // Header Navigation
  readonly navbar: Locator;
  readonly modeSpinBtn: Locator;
  readonly modeTimerBtn: Locator;
  readonly activeTopicCounter: Locator;
  readonly toggleSoundBtn: Locator;
  readonly openSettingsBtn: Locator;

  // Stage Drum Reel
  readonly spinDrumContainer: Locator;
  readonly slotReelViewport: Locator;
  readonly spinReelSequence: Locator;
  readonly centerHighlightFrame: Locator;
  readonly spinStatusLabel: Locator;

  // Giant Clock
  readonly giantClockDisplay: Locator;
  readonly timerDisplay: Locator;
  readonly stageSignalBadge: Locator;
  readonly timerSignalDot: Locator;
  readonly timerActiveTopicText: Locator;

  // Stage Action Controls
  readonly activeTopicHeading: Locator;
  readonly activeConstraintText: Locator;
  readonly lockTopicBtn: Locator;
  readonly spinBtn: Locator;
  readonly openTimerBtn: Locator;
  readonly startTimerBtn: Locator;
  readonly pauseTimerBtn: Locator;
  readonly resetTimerBtn: Locator;
  readonly completeArchiveBtn: Locator;

  // Duration Presets & Custom
  readonly preset1m: Locator;
  readonly preset2m: Locator;
  readonly preset3m: Locator;
  readonly preset5m: Locator;
  readonly customDurationInput: Locator;
  readonly applyCustomDurationBtn: Locator;

  // Cue Notes & Curveball
  readonly cueInput0: Locator;
  readonly cueInput1: Locator;
  readonly cueInput2: Locator;
  readonly cueWordCount0: Locator;
  readonly cueWordCount1: Locator;
  readonly cueWordCount2: Locator;
  readonly toggleCurveballSetting: Locator;
  readonly curveballBanner: Locator;
  readonly dismissCurveballBtn: Locator;

  // Topic Queue Card
  readonly addTitleInput: Locator;
  readonly addTitleBtn: Locator;
  readonly openBulkModalBtn: Locator;
  readonly bulkTitlesTextarea: Locator;
  readonly saveBulkBtn: Locator;
  readonly archiveActiveBtn: Locator;
  readonly deleteActiveBtn: Locator;

  // Stats Card
  readonly statTotalSpeeches: Locator;
  readonly statOntimeRate: Locator;
  readonly statAvgDuration: Locator;
  readonly clearHistoryBtn: Locator;

  // Constraint Card
  readonly constraintReelToggle: Locator;
  readonly shuffleConstraintBtn: Locator;
  readonly openConstraintModalBtn: Locator;
  readonly addConstraintInput: Locator;
  readonly saveConstraintBtn: Locator;

  // Archive Card
  readonly archivedCountBadge: Locator;
  readonly restoreAllBtn: Locator;
  readonly openArchiveDrawerBtn: Locator;

  // UI Toast
  readonly toastNotification: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header
    this.navbar = page.locator('[data-testid="navbar"]');
    this.modeSpinBtn = page.locator('[data-testid="mode-spin-btn"]');
    this.modeTimerBtn = page.locator('[data-testid="mode-timer-btn"]');
    this.activeTopicCounter = page.locator('[data-testid="active-topic-counter"]');
    this.toggleSoundBtn = page.locator('[data-testid="toggle-sound-btn"]');
    this.openSettingsBtn = page.locator('[data-testid="open-settings-btn"]');

    // Reel
    this.spinDrumContainer = page.locator('[data-testid="spin-drum-container"]');
    this.slotReelViewport = page.locator('[data-testid="slot-reel-viewport"]');
    this.spinReelSequence = page.locator('[data-testid="spin-reel-sequence"]');
    this.centerHighlightFrame = page.locator('[data-testid="center-highlight-frame"]');
    this.spinStatusLabel = page.locator('[data-testid="spin-status-label"]');

    // Clock
    this.giantClockDisplay = page.locator('[data-testid="giant-clock-display"]');
    this.timerDisplay = page.locator('[data-testid="timer-display"]');
    this.stageSignalBadge = page.locator('[data-testid="stage-signal-badge"]');
    this.timerSignalDot = page.locator('[data-testid="timer-signal-dot"]');
    this.timerActiveTopicText = page.locator('[data-testid="timer-active-topic-text"]');

    // Action Controls
    this.activeTopicHeading = page.locator('[data-testid="active-topic-heading"]');
    this.activeConstraintText = page.locator('[data-testid="active-constraint-text"]');
    this.lockTopicBtn = page.locator('[data-testid="lock-topic-btn"]');
    this.spinBtn = page.locator('[data-testid="spin-btn"]');
    this.openTimerBtn = page.locator('[data-testid="open-timer-btn"]');
    this.startTimerBtn = page.locator('[data-testid="start-timer-btn"]');
    this.pauseTimerBtn = page.locator('[data-testid="pause-timer-btn"]');
    this.resetTimerBtn = page.locator('[data-testid="reset-timer-btn"]');
    this.completeArchiveBtn = page.locator('[data-testid="complete-archive-btn"]');

    // Presets & Custom
    this.preset1m = page.locator('[data-testid="preset-1m"]');
    this.preset2m = page.locator('[data-testid="preset-2m"]');
    this.preset3m = page.locator('[data-testid="preset-3m"]');
    this.preset5m = page.locator('[data-testid="preset-5m"]');
    this.customDurationInput = page.locator('[data-testid="custom-duration-input"]');
    this.applyCustomDurationBtn = page.locator('[data-testid="apply-custom-duration-btn"]');

    // Cues & Curveball
    this.cueInput0 = page.locator('[data-testid="cue-input-0"]');
    this.cueInput1 = page.locator('[data-testid="cue-input-1"]');
    this.cueInput2 = page.locator('[data-testid="cue-input-2"]');
    this.cueWordCount0 = page.locator('[data-testid="cue-word-count-0"]');
    this.cueWordCount1 = page.locator('[data-testid="cue-word-count-1"]');
    this.cueWordCount2 = page.locator('[data-testid="cue-word-count-2"]');
    this.toggleCurveballSetting = page.locator('[data-testid="toggle-curveball-setting"]');
    this.curveballBanner = page.locator('[data-testid="curveball-banner"]');
    this.dismissCurveballBtn = page.locator('[data-testid="dismiss-curveball-btn"]');

    // Topic Queue
    this.addTitleInput = page.locator('[data-testid="add-title-input"]');
    this.addTitleBtn = page.locator('[data-testid="add-title-btn"]');
    this.openBulkModalBtn = page.locator('[data-testid="open-bulk-modal-btn"]');
    this.bulkTitlesTextarea = page.locator('[data-testid="bulk-titles-textarea"]');
    this.saveBulkBtn = page.locator('[data-testid="save-bulk-btn"]');
    this.archiveActiveBtn = page.locator('[data-testid="archive-active-btn"]');
    this.deleteActiveBtn = page.locator('[data-testid="delete-active-btn"]');

    // Stats
    this.statTotalSpeeches = page.locator('[data-testid="stat-total-speeches"]');
    this.statOntimeRate = page.locator('[data-testid="stat-ontime-rate"]');
    this.statAvgDuration = page.locator('[data-testid="stat-avg-duration"]');
    this.clearHistoryBtn = page.locator('[data-testid="clear-history-btn"]');

    // Constraints
    this.constraintReelToggle = page.locator('[data-testid="constraint-reel-toggle"]');
    this.shuffleConstraintBtn = page.locator('[data-testid="shuffle-constraint-btn"]');
    this.openConstraintModalBtn = page.locator('[data-testid="open-constraint-modal-btn"]');
    this.addConstraintInput = page.locator('[data-testid="add-constraint-input"]');
    this.saveConstraintBtn = page.locator('[data-testid="save-constraint-btn"]');

    // Archive
    this.archivedCountBadge = page.locator('[data-testid="archived-count-badge"]');
    this.restoreAllBtn = page.locator('[data-testid="restore-all-btn"]');
    this.openArchiveDrawerBtn = page.locator('[data-testid="open-archive-drawer-btn"]');

    // Toast
    this.toastNotification = page.locator('[data-testid="toast-notification"]');
  }

  async goto() {
    await this.page.goto("/");
    await this.page.waitForLoadState("domcontentloaded");
  }

  async clearStorageAndReload() {
    await this.page.evaluate(() => localStorage.clear());
    await this.page.reload();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async switchMode(mode: "SPIN" | "TIMER") {
    if (mode === "SPIN") {
      await this.modeSpinBtn.click();
    } else {
      await this.modeTimerBtn.click();
    }
  }

  async triggerSpinAndWait() {
    await this.spinBtn.click();
    await expect(this.spinBtn).toBeDisabled();
    // Wait for 6.5s animation to settle and re-enable spinBtn
    await expect(this.spinBtn).toBeEnabled({ timeout: 10000 });
  }

  async addTopic(title: string) {
    await this.addTitleInput.fill(title);
    await this.addTitleBtn.click();
  }

  async selectPreset(preset: "1m" | "2m" | "3m" | "5m") {
    const card = this.page.locator(`[data-testid="preset-${preset}"]`);
    await card.click();
  }

  async setCustomDuration(minutes: string) {
    await this.customDurationInput.fill(minutes);
    await this.applyCustomDurationBtn.click();
  }
}
