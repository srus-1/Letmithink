import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 1 - Category 1: Header & Mode Navigation", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("TC-1.1: Navbar container and branding are rendered correctly", async () => {
    await expect(app.navbar).toBeVisible();
    await expect(app.navbar.locator('img[alt="Letmithink"]')).toBeVisible();
    await expect(app.navbar).toContainText("letmithink");
  });

  test("TC-1.2: Active topic counter displays accurate initial count", async () => {
    await expect(app.activeTopicCounter).toBeVisible();
    const countText = await app.activeTopicCounter.innerText();
    expect(Number(countText)).toBeGreaterThan(0);
  });

  test("TC-1.3: Mode switcher defaults to SPIN mode with spin drum visible", async () => {
    await expect(app.spinDrumContainer).toBeVisible();
    await expect(app.giantClockDisplay).not.toBeVisible();
  });

  test("TC-1.4: Mode switcher can switch to TIMER mode displaying giant clock", async () => {
    await app.switchMode("TIMER");
    await expect(app.giantClockDisplay).toBeVisible();
    await expect(app.spinDrumContainer).not.toBeVisible();
  });

  test("TC-1.5: Mode switcher can toggle back to SPIN mode cleanly", async () => {
    await app.switchMode("TIMER");
    await expect(app.giantClockDisplay).toBeVisible();
    await app.switchMode("SPIN");
    await expect(app.spinDrumContainer).toBeVisible();
    await expect(app.giantClockDisplay).not.toBeVisible();
  });

  test("TC-1.6: Sound toggle button reflects active state with aria-label", async () => {
    await expect(app.toggleSoundBtn).toBeVisible();
    const initialLabel = await app.toggleSoundBtn.getAttribute("aria-label");
    expect(initialLabel).toBeTruthy();
    await app.toggleSoundBtn.click();
    const toggledLabel = await app.toggleSoundBtn.getAttribute("aria-label");
    expect(toggledLabel).not.toBe(initialLabel);
  });
});
