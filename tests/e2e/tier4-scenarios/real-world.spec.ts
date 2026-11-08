import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 4: Real-World Rehearsal User Journeys", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("Journey 4.1: Complete Public Speaking Rehearsal from Ideation to Archival", async ({ page }) => {
    // 1. User enters custom speech topic
    const customTopic = `Strategi Arsitektur Micro-Frontend 2026 ${Date.now()}`;
    await app.addTopic(customTopic);

    // 2. User spins the topic drum
    await app.triggerSpinAndWait();
    await expect(app.spinStatusLabel).toContainText("Topik Terpilih");

    // 3. User enters 3 bullet cue notes (each <= 5 words)
    await app.cueInput0.fill("Tantangan integrasi modul monolitik lama");
    await expect(app.cueWordCount0).toHaveText("5/5");

    await app.cueInput1.fill("Adopsi framework modern web terdistribusi");
    await expect(app.cueWordCount1).toHaveText("5/5");

    await app.cueInput2.fill("Rencana migrasi bertahap kuartal satu");
    await expect(app.cueWordCount2).toHaveText("5/5");

    // 4. User selects 1m Kilat preset
    await app.selectPreset("1m");
    await app.switchMode("TIMER");
    await expect(app.timerDisplay).toHaveText("00:01:00");

    // 5. User starts speaking timer
    await app.startTimerBtn.click();
    await page.waitForTimeout(1100);

    // 6. User concludes speech and clicks "Selesai & Arsipkan"
    await app.completeArchiveBtn.click();
    await expect(app.toastNotification).toBeVisible();

    // 7. Verify session logged in Stats card (<15s test session excluded from on-time rate) and cue notes reset
    await expect(app.statTotalSpeeches).toHaveText("1");
    await expect(app.statOntimeRate).toHaveText("0%");
    await expect(app.cueInput0).toHaveValue("");
    await expect(app.cueWordCount0).toHaveText("0/5");
  });

  test("Journey 4.2: Rapid Impromptu Drill with Duration Customization", async () => {
    // 1. User configures custom 3 minute duration
    await app.switchMode("TIMER");
    await app.setCustomDuration("3");
    await expect(app.timerDisplay).toHaveText("00:03:00");

    // 2. User enables the curveball toggle (off by default per spec)
    await app.toggleCurveballSetting.check();
    await expect(app.toggleCurveballSetting).toBeChecked();

    // 3. User returns to SPIN and spins
    await app.switchMode("SPIN");
    await app.triggerSpinAndWait();

    // 4. User launches timer
    await app.switchMode("TIMER");
    await app.startTimerBtn.click();
    await app.pauseTimerBtn.click();

    // 5. User resets and finishes drill
    await app.resetTimerBtn.click();
    await expect(app.timerDisplay).toHaveText("00:03:00");
  });

  test("Journey 4.3: Session Log Verification in Bento Analytics Card", async ({ page }) => {
    // 1. Spin topic and complete presentation session
    await app.triggerSpinAndWait();
    const topicTitle = await app.activeTopicHeading.innerText();

    await app.switchMode("TIMER");
    await app.selectPreset("1m");
    await app.startTimerBtn.click();
    await app.completeArchiveBtn.click();

    // 2. Verify historical log card appears in Bento stats
    const firstLog = page.locator('[data-testid^="session-log-card-"]').first();
    await expect(firstLog).toBeVisible();
    await expect(firstLog).toContainText(topicTitle);
  });

  test("Journey 4.4: Content Management Lifecycle (Bulk Import, Rehearse, Archive Drawer)", async ({ page }) => {
    // 1. Bulk import new topics
    await app.openBulkModalBtn.click();
    const topics = `Topik Siklus A ${Date.now()}\nTopik Siklus B ${Date.now()}`;
    await app.bulkTitlesTextarea.fill(topics);
    await app.saveBulkBtn.click();

    // 2. Archive one topic manually
    const archiveBtn = page.locator('[data-testid="archive-active-btn"]').first();
    await archiveBtn.click();
    await expect(app.archivedCountBadge).toHaveText("1");

    // 3. Open archive drawer to inspect archived topics
    await app.openArchiveDrawerBtn.click();
    const drawer = page.locator('[data-testid="archive-drawer"]');
    await expect(drawer).toBeVisible();

    // 4. Close drawer
    const closeDrawerBtn = page.locator('[data-testid="close-archive-drawer-btn"]');
    await closeDrawerBtn.click();
    await expect(drawer).not.toBeVisible();
  });

  test("Journey 4.5: Storage Persistence Across Full Page Reload", async ({ page }) => {
    // 1. Add unique topic
    const persistentTopic = `Topik Uji Muat Ulang ${Date.now()}`;
    await app.addTopic(persistentTopic);

    // 2. Mute sound
    await app.toggleSoundBtn.click();

    // 3. Reload page
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // 4. Verify topic is still in queue
    const firstTopic = page.locator('[data-testid^="active-topic-item-"]').first();
    await expect(firstTopic).toContainText(persistentTopic);

    // 5. Verify sound mute state persisted
    const label = await app.toggleSoundBtn.getAttribute("aria-label");
    expect(label).toContain("Aktifkan");
  });
});
