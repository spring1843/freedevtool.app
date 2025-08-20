import { test, expect } from "@playwright/test";

test.describe("TypeScript Formatter Tool", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/typescript-formatter");
  });

  test("should load TypeScript formatter page without errors", async ({
    page,
  }) => {
    // Wait for the page to load completely
    await page.waitForSelector('[data-testid="typescript-input"]');

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
    await expect(page).toHaveTitle(/TypeScript Formatter/);

    // Should have the main elements
    await expect(page.locator("h2")).toContainText("TypeScript Formatter");
    await expect(
      page.locator('[data-testid="typescript-input"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="typescript-output"]')
    ).toBeVisible();
  });

  test("should format TypeScript code correctly", async ({ page }) => {
    const input = "interface User{name:string;age:number;}";

    await page.fill('[data-testid="typescript-input"]', input);
    await page.click("text=Beautify TypeScript");

    // Wait for formatting to complete
    await page.waitForTimeout(500);

    const output = await page.inputValue('[data-testid="typescript-output"]');
    expect(output).toContain("interface User");
    expect(output).toContain("name: string");
    expect(output).toContain("age: number");
  });

  test("should minify TypeScript code correctly", async ({ page }) => {
    const input = "interface User {\n  name: string;\n  age: number;\n}";

    await page.fill('[data-testid="typescript-input"]', input);
    await page.click("text=Minify TypeScript");

    // Wait for formatting to complete
    await page.waitForTimeout(500);

    const output = await page.inputValue('[data-testid="typescript-output"]');
    expect(output.length).toBeLessThan(input.length);
    expect(output).toContain("interface User");
  });

  test("should reset to default content", async ({ page }) => {
    // Clear the input
    await page.fill('[data-testid="typescript-input"]', "");

    // Click reset
    await page.click("text=Reset");

    // Should have default content back
    const inputValue = await page.inputValue(
      '[data-testid="typescript-input"]'
    );
    expect(inputValue).toContain("interface User");
    expect(inputValue).toContain("UserManager");
    expect(inputValue).toContain("Permission");
  });
});
