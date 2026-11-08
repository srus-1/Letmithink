import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 2 - Category 2: Topic List Cardinality & Empty States", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("TC-2.2.1: Restore all button is disabled when archived list is empty (0)", async () => {
    await expect(app.archivedCountBadge).toHaveText("0");
    await expect(app.restoreAllBtn).toBeDisabled();
  });

  test("TC-2.2.2: Spinning with exactly 1 active topic completes safely without crashes", async ({ page }) => {
    // Delete topics until exactly 1 remains
    const deleteButtons = page.locator('[data-testid="delete-active-btn"]');
    while ((await deleteButtons.count()) > 1) {
      await deleteButtons.first().click();
      await page.waitForTimeout(50);
    }

    await expect(app.activeTopicCounter).toHaveText("1");
    await app.triggerSpinAndWait();
    const heading = await app.activeTopicHeading.innerText();
    expect(heading.length).toBeGreaterThan(0);
    await expect(app.spinStatusLabel).toContainText("Topik Terpilih");
  });

  test("TC-2.2.3: When queue is empty, spinning shows warning toast", async ({ page }) => {
    // Clear all topics via delete
    const deleteButtons = page.locator('[data-testid="delete-active-btn"]');
    while ((await deleteButtons.count()) > 0) {
      await deleteButtons.first().click();
      await page.waitForTimeout(50);
    }

    await expect(app.activeTopicCounter).toHaveText("0");
    await app.spinBtn.click();
    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("kosong");
  });

  test("TC-2.2.4: Empty slot reel viewport renders informative empty state notice", async ({ page }) => {
    const deleteButtons = page.locator('[data-testid="delete-active-btn"]');
    while ((await deleteButtons.count()) > 0) {
      await deleteButtons.first().click();
      await page.waitForTimeout(50);
    }

    await expect(app.slotReelViewport).toContainText("Daftar judul kosong");
  });

  test("TC-2.2.5: Constraint deletion safeguard prevents deleting the last remaining constraint", async ({ page }) => {
    await app.openConstraintModalBtn.click();
    const deleteBtns = page.locator('[data-testid^="delete-constraint-btn-"]');

    while ((await deleteBtns.count()) > 1) {
      await deleteBtns.first().click();
      await page.waitForTimeout(50);
    }

    expect(await deleteBtns.count()).toBe(1);
    // Clicking the last remaining delete button should either be disabled or show safeguard toast
    await deleteBtns.first().click();
    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("Minimal 1 aturan tantangan");
  });
});
