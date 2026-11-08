import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 2 - Category 3: Rapid Clicks & Concurrent Interactions", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("TC-2.3.1: Rapid multi-clicking spin button triggers only one animation cycle", async () => {
    await app.spinBtn.click();
    await app.spinBtn.click({ force: true }).catch(() => {});
    await app.spinBtn.click({ force: true }).catch(() => {});
    await expect(app.spinBtn).toBeDisabled();
    await expect(app.spinBtn).toBeEnabled({ timeout: 10000 });
  });

  test("TC-2.3.2: Switching mode to Timer while spinning does not crash application", async ({ page }) => {
    await app.spinBtn.click();
    await app.switchMode("TIMER");
    await expect(app.giantClockDisplay).toBeVisible();
    await page.waitForTimeout(1000);
    await app.switchMode("SPIN");
    await expect(app.spinDrumContainer).toBeVisible();
  });

  test("TC-2.3.3: Rapid clicking Start / Pause maintains stable timer interval", async ({ page }) => {
    await app.switchMode("TIMER");
    for (let i = 0; i < 4; i++) {
      if (await app.startTimerBtn.isVisible()) {
        await app.startTimerBtn.click();
      } else if (await app.pauseTimerBtn.isVisible()) {
        await app.pauseTimerBtn.click();
      }
      await page.waitForTimeout(100);
    }
    const val = await app.timerDisplay.innerText();
    expect(val).toMatch(/00:0[12]:[0-9]{2}/);
  });

  test("TC-2.3.4: Resetting timer while actively running halts countdown and resets state", async ({ page }) => {
    await app.switchMode("TIMER");
    await app.startTimerBtn.click();
    await page.waitForTimeout(1100);
    await app.resetTimerBtn.click();
    await expect(app.timerDisplay).toHaveText("00:02:00");
    await expect(app.startTimerBtn).toContainText("Mulai Timer");
  });

  test("TC-2.3.5: Keyboard shortcut Spacebar toggles timer cleanly", async ({ page }) => {
    await app.switchMode("TIMER");
    await page.keyboard.press("Space");
    await expect(app.pauseTimerBtn).toBeVisible();
    await page.keyboard.press("Space");
    await expect(app.startTimerBtn).toBeVisible();
  });
});
