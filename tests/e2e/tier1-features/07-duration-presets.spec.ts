import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 1 - Category 7: 3-Option Timer Duration Selection (1m, 2m, Custom)", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
    await app.switchMode("TIMER");
  });

  test("TC-7.1: All 3 duration options (1m, 2m, Custom) are visible", async () => {
    await expect(app.preset1m).toBeVisible();
    await expect(app.preset2m).toBeVisible();
    await expect(app.customDurationInput).toBeVisible();
  });

  test("TC-7.2: Selecting 1m preset sets timer to 00:01:00", async () => {
    await app.selectPreset("1m");
    await expect(app.timerDisplay).toHaveText("00:01:00");
  });

  test("TC-7.3: Selecting 2m preset sets timer to 00:02:00", async () => {
    await app.selectPreset("1m");
    await app.selectPreset("2m");
    await expect(app.timerDisplay).toHaveText("00:02:00");
  });

  test("TC-7.4: Using 3rd option (Atur Sendiri) sets custom timer duration", async () => {
    await app.setCustomDuration("5");
    await expect(app.timerDisplay).toHaveText("00:05:00");
  });

  test("TC-7.5: Active preset card shows active visual styling", async () => {
    await app.selectPreset("1m");
    const classAttr = await app.preset1m.getAttribute("class");
    expect(classAttr).toContain("bg-ink");
  });

  test("TC-7.6: Preset buttons are disabled while timer is actively running", async () => {
    await app.startTimerBtn.click();
    await expect(app.preset1m).toBeDisabled();
    await expect(app.preset2m).toBeDisabled();
    await expect(app.customDurationInput).toBeDisabled();
  });
});
