import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 1 - Category 4: Streamlined Direct Topic Selection (No Lock Friction)", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("TC-4.1: Redundant lock button is removed for friction-free stage flow", async () => {
    await expect(app.lockTopicBtn).toHaveCount(0);
    await app.triggerSpinAndWait();
    await expect(app.lockTopicBtn).toHaveCount(0);
  });

  test("TC-4.2: Spun topic updates status badge to Topik Terpilih in the reel", async () => {
    await app.triggerSpinAndWait();
    await expect(app.spinStatusLabel).toContainText("Topik Terpilih");
  });

  test("TC-4.3: Spin button re-enables immediately after spin settles", async () => {
    await app.triggerSpinAndWait();
    await expect(app.spinBtn).toBeEnabled();
  });

  test("TC-4.4: User can spin again immediately without unlocking", async () => {
    await app.triggerSpinAndWait();
    await app.spinBtn.click();
    await expect(app.spinBtn).toBeDisabled();
  });

  test("TC-4.5: Selected topic in center slot transfers directly to Timer stage", async () => {
    await app.triggerSpinAndWait();
    const chosen = await app.activeTopicHeading.innerText();
    await app.openTimerBtn.click();
    await expect(app.timerActiveTopicText).toHaveText(chosen);
  });
});
