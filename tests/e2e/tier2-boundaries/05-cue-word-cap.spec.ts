import { test, expect } from "@playwright/test";
import { PresentationPage } from "../pages/presentation.page";

test.describe("Tier 2 - Category 5: Cue Notes 5-Word Cap Boundaries", () => {
  let app: PresentationPage;

  test.beforeEach(async ({ page }) => {
    app = new PresentationPage(page);
    await app.goto();
  });

  test("TC-2.5.1: Multiple consecutive spaces are normalized in word count", async () => {
    await app.cueInput0.fill("Kata1   Kata2     Kata3");
    await expect(app.cueWordCount0).toHaveText("3/5");
  });

  test("TC-2.5.2: Exactly 5 words input yields 5/5 count badge", async () => {
    await app.cueInput1.fill("Satu dua tiga empat lima");
    await expect(app.cueWordCount1).toHaveText("5/5");
  });

  test("TC-2.5.3: Pasting a long 20-word paragraph is truncated to exactly 5 words", async () => {
    const longParagraph = "Ini adalah paragraf yang sangat panjang sekali dibuat untuk menguji pemotongan kata otomatis lima kata maksimal tanpa terkecuali sama sekali.";
    await app.cueInput2.fill(longParagraph);
    const value = await app.cueInput2.inputValue();
    const words = value.trim().split(/\s+/).filter(Boolean);
    expect(words.length).toBe(5);
    await expect(app.cueWordCount2).toHaveText("5/5");
  });

  test("TC-2.5.4: Clearing text in cue input resets word count badge to 0/5", async () => {
    await app.cueInput0.fill("Satu dua tiga");
    await expect(app.cueWordCount0).toHaveText("3/5");
    await app.cueInput0.fill("");
    await expect(app.cueWordCount0).toHaveText("0/5");
  });

  test("TC-2.5.5: Hyphenated words (misal: tanya-jawab) are counted as single words", async () => {
    await app.cueInput1.fill("Sesi tanya-jawab secara langsung cepat");
    await expect(app.cueWordCount1).toHaveText("5/5");
  });
});
