import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 1 - Category 11: Topic Queue & CRUD Operations", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("TC-11.1: Quick single topic input and submit button are present", async () => {
    await expect(app.addTitleInput).toBeVisible();
    await expect(app.addTitleBtn).toBeVisible();
  });

  test("TC-11.2: Adding a unique topic increments counter and adds to queue", async () => {
    const initialCount = Number(await app.activeTopicCounter.innerText());
    const uniqueTitle = `Topik Unik Baru ${Date.now()}`;

    await app.addTopic(uniqueTitle);
    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("berhasil ditambahkan");

    const newCount = Number(await app.activeTopicCounter.innerText());
    expect(newCount).toBe(initialCount + 1);
  });

  test("TC-11.3: Submitting duplicate topic shows warning toast", async () => {
    const duplicateTitle = "Strategi Efisiensi Biaya Cloud Tanpa Mengorbankan Performa";
    await app.addTopic(duplicateTitle);

    await expect(app.toastNotification).toBeVisible();
    await expect(app.toastNotification).toContainText("sudah ada");
  });

  test("TC-11.4: Open bulk modal button displays bulk import dialog", async ({ page }) => {
    await app.openBulkModalBtn.click();
    const modal = page.locator('[data-testid="bulk-add-modal"]');
    await expect(modal).toBeVisible();
    await expect(app.bulkTitlesTextarea).toBeVisible();
    await expect(app.saveBulkBtn).toBeVisible();

    const closeBtn = page.locator('[data-testid="close-bulk-modal-btn"]');
    await closeBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test("TC-11.5: Bulk importing 3 topics adds all 3 to the queue", async ({ page }) => {
    const initialCount = Number(await app.activeTopicCounter.innerText());
    await app.openBulkModalBtn.click();

    const bulkText = `Topik Masal 1 ${Date.now()}\nTopik Masal 2 ${Date.now()}\nTopik Masal 3 ${Date.now()}`;
    await app.bulkTitlesTextarea.fill(bulkText);
    await app.saveBulkBtn.click();

    await expect(app.toastNotification).toBeVisible();
    const newCount = Number(await app.activeTopicCounter.innerText());
    expect(newCount).toBe(initialCount + 3);
  });

  test("TC-11.6: Active topic item renders archive and delete buttons", async ({ page }) => {
    const firstArchiveBtn = page.locator('[data-testid="archive-active-btn"]').first();
    const firstDeleteBtn = page.locator('[data-testid="delete-active-btn"]').first();
    await expect(firstArchiveBtn).toBeVisible();
    await expect(firstDeleteBtn).toBeVisible();
  });

  test("TC-11.7: Archiving an active topic moves it to archive counter", async ({ page }) => {
    const initialActive = Number(await app.activeTopicCounter.innerText());
    const initialArchived = Number(await app.archivedCountBadge.innerText());

    const firstArchiveBtn = page.locator('[data-testid="archive-active-btn"]').first();
    await firstArchiveBtn.click();

    await expect(app.toastNotification).toBeVisible();
    const newActive = Number(await app.activeTopicCounter.innerText());
    const newArchived = Number(await app.archivedCountBadge.innerText());

    expect(newActive).toBe(initialActive - 1);
    expect(newArchived).toBe(initialArchived + 1);
  });

  test("TC-11.8: Deleting an active topic removes it permanently from queue", async ({ page }) => {
    const initialActive = Number(await app.activeTopicCounter.innerText());
    const firstDeleteBtn = page.locator('[data-testid="delete-active-btn"]').first();
    await firstDeleteBtn.click();

    await expect(app.toastNotification).toBeVisible();
    const newActive = Number(await app.activeTopicCounter.innerText());
    expect(newActive).toBe(initialActive - 1);
  });
});
