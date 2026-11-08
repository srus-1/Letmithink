import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 1 - Category 5: Presentation Timer Engine", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
    await app.switchMode("TIMER");
  });

  test("TC-5.1: Giant clock displays default duration of 00:02:00", async () => {
    await expect(app.giantClockDisplay).toBeVisible();
    await expect(app.timerDisplay).toHaveText("00:02:00");
  });

  test("TC-5.2: Start timer button begins countdown and changes to Jeda", async () => {
    await expect(app.startTimerBtn).toBeVisible();
    await app.startTimerBtn.click();
    await expect(app.pauseTimerBtn).toBeVisible();
    await expect(app.pauseTimerBtn).toContainText("Jeda");
  });

  test("TC-5.3: Clock decrements accurately after interval tick", async ({ page }) => {
    await app.startTimerBtn.click();
    // Wait for at least 1 second tick
    await page.waitForTimeout(1300);
    const text = await app.timerDisplay.innerText();
    expect(text).toMatch(/00:01:5[89]/);
  });

  test("TC-5.4: Clicking pause halts countdown and shows Lanjut button", async ({ page }) => {
    await app.startTimerBtn.click();
    await page.waitForTimeout(1200);
    await app.pauseTimerBtn.click();

    await expect(app.startTimerBtn).toBeVisible();
    await expect(app.startTimerBtn).toContainText("Lanjut");

    const timeAtPause = await app.timerDisplay.innerText();
    await page.waitForTimeout(1200);
    const timeLater = await app.timerDisplay.innerText();
    expect(timeLater).toBe(timeAtPause);
  });

  test("TC-5.5: Reset timer restores original target duration and resets button", async ({ page }) => {
    await app.startTimerBtn.click();
    await page.waitForTimeout(1200);
    await app.resetTimerBtn.click();

    await expect(app.timerDisplay).toHaveText("00:02:00");
    await expect(app.startTimerBtn).toContainText("Mulai Timer");
  });

  test("TC-5.6: Timer display uses tabular numbers to prevent digit layout jitter", async () => {
    const classList = await app.timerDisplay.getAttribute("class");
    expect(classList).toContain("tabular-nums");
  });
});
