import { test, expect } from "@playwright/test";

test.describe("Text Sorter Tool", () => {
  test.beforeEach(async ({ page }) => {
    // Track JavaScript and console errors
    page.on("pageerror", error => {
      console.error(`JavaScript error: ${error.message}`);
    });

    page.on("console", msg => {
      if (msg.type() === "error") {
        console.error(`Console error: ${msg.text()}`);
      }
    });
  });

  test("should load without errors", async ({ page }) => {
    const jsErrors: string[] = [];
    const consoleErrors: string[] = [];

    // Track errors
    page.on("pageerror", error => {
      jsErrors.push(error.message);
    });

    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to the tool
    await page.goto("/tools/text-sort");
    await page.waitForLoadState("networkidle");

    // Wait for content to load
    await page.waitForFunction(
      () => {
        const mainContent = document.querySelector("main");
        return mainContent && mainContent.children.length > 0;
      },
      undefined,
      { timeout: 10000 }
    );

    // Verify basic page structure
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("header")).toBeVisible();

    // Verify tool-specific content
    const heading = page.locator("h1, h2, h3").first();
    await expect(heading).toBeVisible();

    // Verify theme toggle works
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();

    // Wait for theme change
    await page.waitForFunction(
      () => {
        const { className } = document.documentElement;
        return className.includes("dark") || className.includes("light");
      },
      undefined,
      { timeout: 2000 }
    );

    // Wait for any delayed operations
    await page.waitForFunction(() => true, undefined, { timeout: 1000 });

    // Filter critical errors
    const criticalConsoleErrors = consoleErrors.filter(
      error =>
        !error.includes("favicon") &&
        !error.includes("404") &&
        !error.toLowerCase().includes("warning")
    );

    // Verify no errors occurred
    expect(jsErrors, `JavaScript errors: ${jsErrors.join(", ")}`).toHaveLength(
      0
    );
    expect(
      criticalConsoleErrors,
      `Console errors: ${criticalConsoleErrors.join(", ")}`
    ).toHaveLength(0);

    // Verify page title
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    expect(pageTitle.length).toBeGreaterThan(0);
  });
});
