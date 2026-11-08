import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 1 - Category 6: 6-Phase Dynamic Stage Signals", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
    await app.switchMode("TIMER");
  });

  test("TC-6.1: Initial stage signal displays Siap Mulai status", async () => {
    await expect(app.stageSignalBadge).toBeVisible();
    await expect(app.stageSignalBadge).toContainText("Siap Mulai");
  });

  test("TC-6.2: Stage signal transitions to Fase Awal when timer starts", async ({ page }) => {
    await app.startTimerBtn.click();
    await page.waitForTimeout(500);
    await expect(app.stageSignalBadge).toContainText("Fase Awal");
  });

  test("TC-6.3: Stage signal badge includes dot indicator with proper styling", async () => {
    await expect(app.timerSignalDot).toBeVisible();
    const classAttr = await app.timerSignalDot.getAttribute("class");
    expect(classAttr).toContain("rounded-full");
  });

  test("TC-6.4: Resetting timer returns stage signal to Siap Mulai", async ({ page }) => {
    await app.startTimerBtn.click();
    await page.waitForTimeout(1000);
    await app.resetTimerBtn.click();
    await expect(app.stageSignalBadge).toContainText("Siap Mulai");
  });

  test("TC-6.5: Timer active topic text reflects selected topic or guidance", async () => {
    await expect(app.timerActiveTopicText).toBeVisible();
    const text = await app.timerActiveTopicText.innerText();
    expect(text.length).toBeGreaterThan(0);
  });

  test("TC-6.6: Active topic text updates when spun before switching to timer", async () => {
    await app.switchMode("SPIN");
    await app.triggerSpinAndWait();
    const chosen = await app.activeTopicHeading.innerText();

    await app.switchMode("TIMER");
    await expect(app.timerActiveTopicText).toHaveText(chosen);
  });
});
