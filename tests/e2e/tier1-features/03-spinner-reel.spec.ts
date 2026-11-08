import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 1 - Category 3: Vertical Topic Spinner Physics", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("TC-3.1: Reel container, viewport and center highlight frame are properly sized", async () => {
    await expect(app.spinDrumContainer).toBeVisible();
    await expect(app.slotReelViewport).toBeVisible();
    await expect(app.centerHighlightFrame).toBeVisible();

    const box = await app.slotReelViewport.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBe(288);
    }
  });

  test("TC-3.2: Spin button is enabled initially and initiates spin on click", async () => {
    await expect(app.spinBtn).toBeEnabled();
    await app.spinBtn.click();
    await expect(app.spinBtn).toBeDisabled();
  });

  test("TC-3.3: Center highlight frame renders dual vertical detent markers", async () => {
    const frame = app.centerHighlightFrame;
    const markers = frame.locator("div");
    await expect(markers).toHaveCount(2);
  });

  test("TC-3.4: Spin button changes text label to indicate active spinning", async () => {
    await app.spinBtn.click();
    await expect(app.spinBtn).toContainText("Menggulir");
  });

  test("TC-3.5: Spin animation settles and selects the chosen topic directly in the reel", async () => {
    await app.spinBtn.click();
    await expect(app.spinBtn).toBeDisabled();
    await expect(app.spinBtn).toBeEnabled({ timeout: 10000 });
    await expect(app.spinStatusLabel).toContainText("Topik Terpilih");
  });

  test("TC-3.6: Active topic heading is updated with chosen topic upon spin completion", async () => {
    await app.triggerSpinAndWait();
    const heading = await app.activeTopicHeading.innerText();
    expect(heading).not.toBe("Tekan 'Putar Ide' untuk Memulai");
    expect(heading.length).toBeGreaterThan(5);
  });
});
