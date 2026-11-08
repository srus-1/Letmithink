import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 2 - Category 1: Duration Boundaries & Validation", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
    await app.switchMode("TIMER");
  });

  test("TC-2.1.1: 0 minutes input is rejected with warning toast", async () => {
    await app.setCustomDuration("0");
    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("antara 1 hingga 120 menit");
    await expect(app.timerDisplay).toHaveText("00:02:00");
  });

  test("TC-2.1.2: Negative minutes input is rejected", async () => {
    await app.setCustomDuration("-5");
    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("antara 1 hingga 120 menit");
    await expect(app.timerDisplay).toHaveText("00:02:00");
  });

  test("TC-2.1.3: Exceeding 120 minutes (121) is rejected", async () => {
    await app.setCustomDuration("121");
    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("antara 1 hingga 120 menit");
    await expect(app.timerDisplay).toHaveText("00:02:00");
  });

  test("TC-2.1.4: Boundary value 120 minutes is accepted and formats to 02:00:00", async () => {
    await app.setCustomDuration("120");
    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("120 menit");
    await expect(app.timerDisplay).toHaveText("02:00:00");
  });

  test("TC-2.1.5: Boundary value 1 minute is accepted and formats to 00:01:00", async () => {
    await app.setCustomDuration("1");
    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("1 menit");
    await expect(app.timerDisplay).toHaveText("00:01:00");
  });
});
