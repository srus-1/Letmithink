import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 2 - Category 6: LocalStorage Corruption & Recovery", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
  });

  test("TC-2.6.1: Corrupted non-JSON string in localStorage recovers cleanly", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("putartopik_nextjs_v1", "INVALID_CORRUPT_JSON{[{");
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    await expect(app.navbar).toBeVisible();
    await expect(app.activeTopicCounter).toBeVisible();
    const count = Number(await app.activeTopicCounter.innerText());
    expect(count).toBeGreaterThan(0);
  });

  test("TC-2.6.2: Empty object in localStorage hydrates default titles and constraints", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("putartopik_nextjs_v1", JSON.stringify({}));
    });
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const count = Number(await app.activeTopicCounter.innerText());
    expect(count).toBeGreaterThan(0);
  });

  test("TC-2.6.3: Custom added topic persists across page reload", async ({ page }) => {
    await page.goto("/");
    const customTitle = `Topik Persistensi ${Date.now()}`;
    await app.addTopic(customTitle);

    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const firstTopic = page.locator('[data-testid^="active-topic-item-"]').first();
    await expect(firstTopic).toContainText(customTitle);
  });

  test("TC-2.6.4: Sound mute state persists across page reload", async ({ page }) => {
    await page.goto("/");
    await app.toggleSoundBtn.click();
    const labelBefore = await app.toggleSoundBtn.getAttribute("aria-label");

    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    const labelAfter = await app.toggleSoundBtn.getAttribute("aria-label");
    expect(labelAfter).toBe(labelBefore);
  });

  test("TC-2.6.5: Verify storage key matches putartopik_nextjs_v1", async ({ page }) => {
    await page.goto("/");
    await expect
      .poll(async () => {
        return await page.evaluate(() => {
          return localStorage.getItem("putartopik_nextjs_v1") !== null;
        });
      })
      .toBe(true);
  });
});
