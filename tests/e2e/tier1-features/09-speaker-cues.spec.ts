import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 1 - Category 9: 3-Point Cue Notes & 5-Word Cap", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("TC-9.1: All three cue note inputs (01, 02, 03) are visible", async () => {
    await expect(app.cueInput0).toBeVisible();
    await expect(app.cueInput1).toBeVisible();
    await expect(app.cueInput2).toBeVisible();
  });

  test("TC-9.2: Word counter badges display 0/5 initially", async () => {
    await expect(app.cueWordCount0).toHaveText("0/5");
    await expect(app.cueWordCount1).toHaveText("0/5");
    await expect(app.cueWordCount2).toHaveText("0/5");
  });

  test("TC-9.3: Typing 3 words updates word count badge to 3/5", async () => {
    await app.cueInput0.fill("Satu dua tiga");
    await expect(app.cueWordCount0).toHaveText("3/5");
  });

  test("TC-9.4: Typing 5 words updates word count badge to 5/5", async () => {
    await app.cueInput1.fill("Satu dua tiga empat lima");
    await expect(app.cueWordCount1).toHaveText("5/5");
  });

  test("TC-9.5: Attempting to type a 6th word is capped strictly at 5 words", async () => {
    await app.cueInput2.fill("Satu dua tiga empat lima enam tujuh");
    const val = await app.cueInput2.inputValue();
    const words = val.trim().split(/\s+/).filter(Boolean);
    expect(words.length).toBeLessThanOrEqual(5);
    await expect(app.cueWordCount2).toHaveText("5/5");
  });

  test("TC-9.6: Completing session clears cue notes to empty strings", async () => {
    await app.cueInput0.fill("Catatan pembuka pengantar penting");
    await expect(app.cueWordCount0).toHaveText("4/5");

    await app.switchMode("TIMER");
    await app.completeArchiveBtn.click();

    await expect(app.cueInput0).toHaveValue("");
    await expect(app.cueWordCount0).toHaveText("0/5");
  });
});
