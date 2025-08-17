import { test, expect } from "@playwright/test";

test.describe("Theme Toggle Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should toggle theme without crashes", async ({ page }) => {
    // Verify theme toggle button is visible
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();

    // Test basic toggle functionality
    for (let i = 0; i < 3; i++) {
      // Get current theme state before click
      const beforeClick = await page.evaluate(
        () => document.documentElement.className
      );

      await themeToggle.click();

      // Wait for theme to actually change by checking DOM class
      await page.waitForFunction(
        beforeState => document.documentElement.className !== beforeState,
        beforeClick,
        { timeout: 2000 }
      );

      // Verify page is still responsive
      await expect(themeToggle).toBeVisible();
    }
  });

  test("should maintain theme when navigating between pages", async ({
    page,
  }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');

    // Switch theme
    await themeToggle.click();

    // Wait for theme to change by checking the DOM
    await page.waitForFunction(
      () =>
        document.documentElement.className.includes("dark") ||
        document.documentElement.className.includes("light"),
      undefined,
      { timeout: 2000 }
    );

    // Get theme state
    const themeClass = await page.evaluate(
      () => document.documentElement.className
    );
    const isDark = themeClass.includes("dark");

    // Navigate to a tool page
    await page.goto("/tools/json-formatter");
    await page.waitForLoadState("networkidle");

    // Wait for theme to be applied on new page
    await page.waitForFunction(
      expectedDark => {
        const {className} = document.documentElement;
        return expectedDark
          ? className.includes("dark")
          : className.includes("light");
      },
      isDark,
      { timeout: 3000 }
    );

    // Verify theme persists
    const persistedThemeClass = await page.evaluate(
      () => document.documentElement.className
    );
    const persistedIsDark = persistedThemeClass.includes("dark");

    expect(isDark).toBe(persistedIsDark);

    // Verify toggle still works
    const toolPageThemeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(toolPageThemeToggle).toBeVisible();
  });

  test("should not cause JavaScript errors", async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');

    // Listen for JavaScript errors
    const jsErrors: string[] = [];
    page.on("pageerror", error => {
      jsErrors.push(error.message);
    });

    // Click theme toggle multiple times
    for (let i = 0; i < 5; i++) {
      await themeToggle.click();

      // Wait for theme change instead of fixed timeout
      await page.waitForFunction(
        () => {
          const {className} = document.documentElement;
          return className.includes("dark") || className.includes("light");
        },
        undefined,
        { timeout: 1000 }
      );
    }

    // Verify no errors occurred
    expect(jsErrors).toHaveLength(0);

    // Verify button is still functional
    await expect(themeToggle).toBeVisible();
    await expect(themeToggle).toBeEnabled();
  });
});
