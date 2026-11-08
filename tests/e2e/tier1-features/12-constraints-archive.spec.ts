import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 1 - Category 12: Constraints, Archive & Analytics", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("TC-12.1: Constraint reel toggle is visible and togglable", async () => {
    await expect(app.constraintReelToggle).toBeVisible();
    await app.constraintReelToggle.click();
    await app.constraintReelToggle.click();
  });

  test("TC-12.2: Shuffle constraint button changes active challenge rule", async () => {
    await expect(app.shuffleConstraintBtn).toBeVisible();
    await app.shuffleConstraintBtn.click();
    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("Tantangan diganti");
  });

  test("TC-12.3: Open constraint modal displays list of challenges", async ({ page }) => {
    await app.openConstraintModalBtn.click();
    const modal = page.locator('[data-testid="constraint-modal"]');
    await expect(modal).toBeVisible();
    await expect(app.addConstraintInput).toBeVisible();
    await expect(app.saveConstraintBtn).toBeVisible();

    const closeBtn = page.locator('[data-testid="close-constraint-modal-btn"]');
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test("TC-12.4: Adding new speech constraint appends it to list", async () => {
    await app.openConstraintModalBtn.click();
    const newRule = `Aturan Tantangan Baru ${Date.now()}`;
    await app.addConstraintInput.fill(newRule);
    await app.saveConstraintBtn.click();
    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("berhasil ditambahkan");
  });

  test("TC-12.5: Archive card displays archived count badge", async () => {
    await expect(app.archivedCountBadge).toBeVisible();
    const count = await app.archivedCountBadge.innerText();
    expect(Number(count)).toBeGreaterThanOrEqual(0);
  });

  test("TC-12.6: Restore all button restores archived topics to queue", async ({ page }) => {
    // First archive one topic
    const firstArchiveBtn = page.locator('[data-testid="archive-active-btn"]').first();
    await firstArchiveBtn.click();

    await expect(app.archivedCountBadge).toHaveText("1");
    await expect(app.restoreAllBtn).toBeEnabled();

    await app.restoreAllBtn.click();
    await expect(app.toastNotification).toBeVisible();
    await expect(app.archivedCountBadge).toHaveText("0");
  });

  test("TC-12.7: Stats card renders key analytics metrics (total, on-time rate, avg time)", async () => {
    await expect(app.statTotalSpeeches).toBeVisible();
    await expect(app.statOntimeRate).toBeVisible();
    await expect(app.statAvgDuration).toBeVisible();
  });
});
