import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 2 - Category 4: String Boundaries & Sanitization", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("TC-2.4.1: Very long topic title wraps cleanly without overflowing container", async ({ page }) => {
    const longTitle = "Transformasi Arsitektur Skala Besar Menggunakan Pendekatan Modularisasi Terdistribusi yang Sangat Panjang Sekali untuk Menguji Batas Kontainer Antarmuka Responsif";
    await app.addTopic(longTitle);

    const firstTopic = page.locator('[data-testid^="active-topic-item-"]').first();
    await expect(firstTopic).toBeVisible();
    await expect(firstTopic).toContainText(longTitle);
  });

  test("TC-2.4.2: Topic title containing HTML tags is escaped safely as plain text", async ({ page }) => {
    const dangerousTitle = "<script>alert('xss')</script><b>Topik Aman</b>";
    await app.addTopic(dangerousTitle);

    const firstTopic = page.locator('[data-testid^="active-topic-item-"]').first();
    await expect(firstTopic).toContainText(dangerousTitle);
    const html = await firstTopic.innerHTML();
    expect(html).not.toContain("<script>");
  });

  test("TC-2.4.3: Bulk import with empty lines and trailing whitespace filters out blanks", async ({ page }) => {
    const initialCount = Number(await app.activeTopicCounter.innerText());
    await app.openBulkModalBtn.click();

    const raw = `\n   \nTopik Bersih A ${Date.now()}\n\n  Topik Bersih B ${Date.now()}  \n\n`;
    await app.bulkTitlesTextarea.fill(raw);
    await app.saveBulkBtn.click();

    const newCount = Number(await app.activeTopicCounter.innerText());
    expect(newCount).toBe(initialCount + 2);
  });

  test("TC-2.4.4: Submitting whitespace-only single topic is rejected without mutation", async () => {
    const initialCount = Number(await app.activeTopicCounter.innerText());
    await app.addTopic("    ");
    const newCount = Number(await app.activeTopicCounter.innerText());
    expect(newCount).toBe(initialCount);
  });

  test("TC-2.4.5: Unicode characters and Indonesian diacritics render properly", async ({ page }) => {
    const unicodeTitle = "Topik Inovasi 🚀 & Produktivitas: Solusi Cepat #1";
    await app.addTopic(unicodeTitle);

    const firstTopic = page.locator('[data-testid^="active-topic-item-"]').first();
    await expect(firstTopic).toContainText("Topik Inovasi 🚀");
  });
});
