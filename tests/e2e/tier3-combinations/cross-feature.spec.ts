import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 3: Cross-Feature Combinations & Integrations", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("SC-3.1: Spin -> Topic Selected -> Preset Change -> Timer Countdown", async ({ page }) => {
    await app.triggerSpinAndWait();
    await expect(app.spinStatusLabel).toContainText("Topik Terpilih");
    const chosenTopic = await app.activeTopicHeading.innerText();

    await app.selectPreset("1m");
    await app.switchMode("TIMER");
    await expect(app.timerDisplay).toHaveText("00:01:00");
    await expect(app.timerActiveTopicText).toHaveText(chosenTopic);

    await app.startTimerBtn.click();
    await page.waitForTimeout(1100);
    const tick = await app.timerDisplay.innerText();
    expect(tick).toMatch(/00:00:5[89]/);
  });

  test("SC-3.2: Timer Running -> Background Mode Switch -> Returns and Accumulates", async ({ page }) => {
    await app.switchMode("TIMER");
    await app.startTimerBtn.click();
    await page.waitForTimeout(1000);

    // Switch away to SPIN
    await app.switchMode("SPIN");
    await expect(app.spinDrumContainer).toBeVisible();
    await page.waitForTimeout(1000);

    // Switch back to TIMER
    await app.switchMode("TIMER");
    await expect(app.giantClockDisplay).toBeVisible();
    const remaining = await app.timerDisplay.innerText();
    expect(remaining).toMatch(/00:01:5[78]/);
  });

  test("SC-3.3: Active Topic Deletion Guard preserves rehearsal until completed", async ({ page }) => {
    await app.triggerSpinAndWait();
    const chosenTopic = await app.activeTopicHeading.innerText();

    // Delete first item from queue if it matches or any other
    const deleteBtn = page.locator('[data-testid="delete-active-btn"]').first();
    await deleteBtn.click();

    // The stage heading still holds the active presentation topic
    await expect(app.activeTopicHeading).toHaveText(chosenTopic);
  });

  test("SC-3.4: Custom Duration + Curveball Toggle", async () => {
    await app.switchMode("TIMER");
    await app.setCustomDuration("3");
    await expect(app.timerDisplay).toHaveText("00:03:00");
    await expect(app.toggleCurveballSetting).not.toBeChecked();
    await app.toggleCurveballSetting.check();
    await expect(app.toggleCurveballSetting).toBeChecked();
  });

  test("SC-3.5: Complete & Archive Pipeline moves active topic to archive", async () => {
    await app.triggerSpinAndWait();
    const chosenTopic = await app.activeTopicHeading.innerText();

    await app.switchMode("TIMER");
    await app.startTimerBtn.click();
    await app.completeArchiveBtn.click();

    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("Sesi disimpan");

    // Counter of archived topics incremented
    const archivedCount = Number(await app.archivedCountBadge.innerText());
    expect(archivedCount).toBeGreaterThanOrEqual(1);

    // Total speeches incremented
    await expect(app.statTotalSpeeches).toContainText("1");
  });

  test("SC-3.6: Mute Sound -> Spin -> Unmute Sound -> Spin", async () => {
    await app.toggleSoundBtn.click();
    await app.triggerSpinAndWait();

    await app.toggleSoundBtn.click();
    await app.triggerSpinAndWait();

    await expect(app.activeTopicHeading).toBeVisible();
  });

  test("SC-3.7: Constraint Disabled Rehearsal skips challenge pairing", async () => {
    await app.constraintReelToggle.click(); // Disable constraint pairing
    await app.triggerSpinAndWait();
    await expect(app.activeConstraintText).not.toBeVisible();
  });

  test("SC-3.8: Short test session (<15s) is excluded from 100% on-time rate and labeled Sesi Tes (<15d)", async ({ page }) => {
    await app.switchMode("TIMER");
    await app.selectPreset("1m");
    await app.startTimerBtn.click();
    await app.completeArchiveBtn.click();

    await expect(app.statTotalSpeeches).toHaveText("1");
    await expect(app.statOntimeRate).toHaveText("0%");
    const firstLog = page.locator('[data-testid^="session-log-card-"]').first();
    await expect(firstLog).toContainText("Sesi Tes (<15d)");
  });

  test("SC-3.9: Clear history resets session analytics to 0", async () => {
    await app.switchMode("TIMER");
    await app.completeArchiveBtn.click();
    await expect(app.statTotalSpeeches).toHaveText("1");

    await app.clearHistoryBtn.click();
    await expect(app.statTotalSpeeches).toHaveText("0");
    await expect(app.statOntimeRate).toHaveText("0%");
  });

  test("SC-3.10: Bulk Import -> Rehearse -> Archive -> Restore All", async ({ page }) => {
    const initialActive = Number(await app.activeTopicCounter.innerText());

    await app.openBulkModalBtn.click();
    const bulkTopics = `Alur Tes 1 ${Date.now()}\nAlur Tes 2 ${Date.now()}`;
    await app.bulkTitlesTextarea.fill(bulkTopics);
    await app.saveBulkBtn.click();

    const afterBulk = Number(await app.activeTopicCounter.innerText());
    expect(afterBulk).toBe(initialActive + 2);

    // Archive one
    const firstArchive = page.locator('[data-testid="archive-active-btn"]').first();
    await firstArchive.click();
    await expect(app.archivedCountBadge).toHaveText("1");

    // Restore all
    await app.restoreAllBtn.click();
    await expect(app.archivedCountBadge).toHaveText("0");
  });
});
