import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 1 - Category 8: Custom Duration Input", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
    await app.switchMode("TIMER");
  });

  test("TC-8.1: Custom duration input field and apply button are present", async () => {
    await expect(app.customDurationInput).toBeVisible();
    await expect(app.applyCustomDurationBtn).toBeVisible();
  });

  test("TC-8.2: Entering 7 minutes configures timer target to 00:07:00", async () => {
    await app.setCustomDuration("7");
    await expect(app.timerDisplay).toHaveText("00:07:00");
  });

  test("TC-8.3: Entering 10 minutes configures timer target to 00:10:00", async () => {
    await app.setCustomDuration("10");
    await expect(app.timerDisplay).toHaveText("00:10:00");
  });

  test("TC-8.4: Applying valid custom minutes triggers confirmation toast", async () => {
    await app.setCustomDuration("4");
    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("4 menit");
  });

  test("TC-8.5: Custom duration input meets accessible tap target >= 44px", async () => {
    const box = await app.customDurationInput.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
