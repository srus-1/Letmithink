import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 1 - Category 2: Audio Engine & Sound Toggle", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("TC-2.1: Sound button initializes in active unmuted state", async () => {
    await expect(app.toggleSoundBtn).toBeVisible();
    const label = await app.toggleSoundBtn.getAttribute("aria-label");
    expect(label).toContain("Nonaktifkan");
  });

  test("TC-2.2: Clicking sound button toggles audio to muted state", async () => {
    await app.toggleSoundBtn.click();
    const label = await app.toggleSoundBtn.getAttribute("aria-label");
    expect(label).toContain("Aktifkan");
  });

  test("TC-2.3: Sound mute state persists across page reload", async ({ page }) => {
    await app.toggleSoundBtn.click();
    await expect(app.toggleSoundBtn).toHaveAttribute("aria-label", /^Aktifkan/);
    await page.reload();
    // localStorage is read after hydration, so poll instead of reading once
    await expect(app.toggleSoundBtn).toHaveAttribute("aria-label", /^Aktifkan/);
  });

  test("TC-2.4: Sound button meets accessibility tap target requirement >= 44px", async () => {
    const box = await app.toggleSoundBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  test("TC-2.5: Open settings modal displays audio toggle option", async ({ page }) => {
    await app.openSettingsBtn.click();
    const modal = page.locator('[data-testid="settings-modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Efek Suara Sintesis");
    const closeBtn = page.locator('[data-testid="close-settings-btn"]');
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });
});
