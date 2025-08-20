import { test, expect } from "@playwright/test";

test.describe("JavaScript Formatter Tool", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/javascript-formatter");
  });

  test("should load JavaScript formatter page without errors", async ({
    page,
  }) => {
    // Wait for the page to load completely
    await page.waitForSelector('[data-testid="javascript-input"]');

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
    await expect(page).toHaveTitle(/JavaScript Formatter/);

    // Should have the main elements
    await expect(page.locator("h2")).toContainText("JavaScript Formatter");
    await expect(
      page.locator('[data-testid="javascript-input"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="javascript-output"]')
    ).toBeVisible();
  });

  test("should format JavaScript code correctly", async ({ page }) => {
    const input = 'function test(){return"hello";}';

    await page.fill('[data-testid="javascript-input"]', input);
    await page.click("text=Beautify JavaScript");

    // Wait for formatting to complete
    await page.waitForTimeout(500);

    const output = await page.inputValue('[data-testid="javascript-output"]');
    expect(output).toContain("function test()");
    expect(output).toContain('return "hello";');
  });

  test("should minify JavaScript code correctly", async ({ page }) => {
    const input = 'function test() {\n  return "hello world";\n}';

    await page.fill('[data-testid="javascript-input"]', input);
    await page.click("text=Minify JavaScript");

    // Wait for formatting to complete
    await page.waitForTimeout(500);

    const output = await page.inputValue('[data-testid="javascript-output"]');
    expect(output.length).toBeLessThan(input.length);
    expect(output).toContain("function test()");
  });

  test("should reset to default content", async ({ page }) => {
    // Clear the input
    await page.fill('[data-testid="javascript-input"]', "");

    // Click reset
    await page.click("text=Reset");

    // Should have default content back
    const inputValue = await page.inputValue(
      '[data-testid="javascript-input"]'
    );
    expect(inputValue).toContain("function greetUser");
    expect(inputValue).toContain("Calculator");
  });
});
