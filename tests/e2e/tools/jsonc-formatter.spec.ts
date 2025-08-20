import { test, expect } from "@playwright/test";

test.describe("JSONC Formatter Tool", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/jsonc-formatter");
  });

  test("should load JSONC formatter page without errors", async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForSelector('[data-testid="jsonc-input"]');

    // Check that the page loaded without JavaScript errors
    const jsErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        jsErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    // Should not have any JavaScript errors
    expect(jsErrors).toHaveLength(0);

    // Should display the correct title
    await expect(page).toHaveTitle(/JSONC Formatter/);

    // Should have the main elements
    await expect(page.locator("h2")).toContainText("JSONC Formatter");
    await expect(page.locator('[data-testid="jsonc-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="jsonc-output"]')).toBeVisible();
  });

  test("should format JSONC with comments correctly", async ({ page }) => {
    const input = '{"name":"test",// This is a comment\n"age":30}';

    await page.fill('[data-testid="jsonc-input"]', input);
    await page.click("text=Format JSONC");

    // Wait for formatting to complete
    await page.waitForTimeout(500);

    const output = await page.inputValue('[data-testid="jsonc-output"]');
    expect(output).toContain("// This is a comment");
    expect(output).toContain('"name":');
    expect(output).toContain('"age":');
  });

  test("should preserve multi-line comments", async ({ page }) => {
    const input = '{"test":/* Multi\nline\ncomment */true}';

    await page.fill('[data-testid="jsonc-input"]', input);
    await page.click("text=Format JSONC");

    // Wait for formatting to complete
    await page.waitForTimeout(500);

    const output = await page.inputValue('[data-testid="jsonc-output"]');
    expect(output).toContain("/* Multi");
    expect(output).toContain("line");
    expect(output).toContain("comment */");
  });

  test("should reset to default content", async ({ page }) => {
    // Clear the input
    await page.fill('[data-testid="jsonc-input"]', "");

    // Click reset
    await page.click("text=Reset");

    // Should have default content back
    const inputValue = await page.inputValue('[data-testid="jsonc-input"]');
    expect(inputValue).toContain("// Application configuration");
    expect(inputValue).toContain("my-awesome-app");
    expect(inputValue).toContain("dependencies");
  });
});
