import { test, expect } from "@playwright/test";

test.describe("SCSS Formatter Tool", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/scss-formatter");
  });

  test("should load SCSS formatter page without errors", async ({ page }) => {
    // Wait for the page to load completely
    await page.waitForSelector('[data-testid="scss-input"]');

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
    await expect(page).toHaveTitle(/SCSS Formatter/);

    // Should have the main elements
    await expect(page.locator("h2")).toContainText("SCSS Formatter");
    await expect(page.locator('[data-testid="scss-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="scss-output"]')).toBeVisible();
  });

  test("should format SCSS code correctly", async ({ page }) => {
    const input = ".class{$color:blue;&:hover{color:$color;}}";

    await page.fill('[data-testid="scss-input"]', input);
    await page.click("text=Beautify SCSS");

    // Wait for formatting to complete
    await page.waitForTimeout(500);

    const output = await page.inputValue('[data-testid="scss-output"]');
    expect(output).toContain(".class");
    expect(output).toContain("$color");
  });

  test("should minify SCSS code correctly", async ({ page }) => {
    const input =
      ".class {\n  $color: blue;\n  &:hover {\n    color: $color;\n  }\n}";

    await page.fill('[data-testid="scss-input"]', input);
    await page.click("text=Minify SCSS");

    // Wait for formatting to complete
    await page.waitForTimeout(500);

    const output = await page.inputValue('[data-testid="scss-output"]');
    expect(output.length).toBeLessThan(input.length);
    expect(output).toContain(".class");
  });

  test("should reset to default content", async ({ page }) => {
    // Clear the input
    await page.fill('[data-testid="scss-input"]', "");

    // Click reset
    await page.click("text=Reset");

    // Should have default content back
    const inputValue = await page.inputValue('[data-testid="scss-input"]');
    expect(inputValue).toContain("$primary-color");
    expect(inputValue).toContain("@mixin button-style");
    expect(inputValue).toContain(".container");
  });
});
