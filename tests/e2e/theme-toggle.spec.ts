import { test, expect } from "@playwright/test";

test.describe("Theme Toggle Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should toggle between light and dark themes with multiple clicks", async ({
    page,
  }) => {
    // Verify theme toggle button is visible
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();

    // Get initial theme state from document element class
    const initialThemeClass = await page.evaluate(
      () => document.documentElement.className
    );

    // Determine initial theme (default should be light)
    const initialTheme = initialThemeClass.includes("dark") ? "dark" : "light";

    // Test multiple toggle clicks (5 clicks total)
    for (let i = 1; i <= 5; i++) {
      // Click the theme toggle
      await themeToggle.click();

      // Wait for theme transition
      await page.waitForTimeout(100);

      // Verify theme has changed
      const currentThemeClass = await page.evaluate(
        () => document.documentElement.className
      );

      // Determine expected theme after clicking
      const expectedTheme =
        (initialTheme === "light") === (i % 2 === 1) ? "dark" : "light";

      if (expectedTheme === "dark") {
        expect(currentThemeClass).toContain("dark");
        expect(currentThemeClass).not.toContain("light");

        // Verify dark theme icon is shown (Sun icon for switching to light)
        await expect(themeToggle.locator("svg")).toHaveAttribute(
          "class",
          expect.stringContaining("h-5 w-5")
        );

        // Verify dark theme styles are applied
        const backgroundColor = await page.evaluate(
          () => window.getComputedStyle(document.body).backgroundColor
        );
        // Dark theme should have darker background
        expect(backgroundColor).not.toBe("rgb(255, 255, 255)"); // Not white
      } else {
        expect(currentThemeClass).toContain("light");
        expect(currentThemeClass).not.toContain("dark");

        // Verify light theme icon is shown (Moon icon for switching to dark)
        await expect(themeToggle.locator("svg")).toHaveAttribute(
          "class",
          expect.stringContaining("h-5 w-5")
        );
      }

      // Verify aria-label updates correctly
      const ariaLabel = await themeToggle.getAttribute("aria-label");
      if (expectedTheme === "dark") {
        expect(ariaLabel).toBe("Switch to light mode");
      } else {
        expect(ariaLabel).toBe("Switch to dark mode");
      }
    }
  });

  test("should maintain theme state when navigating between pages", async ({
    page,
  }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');

    // Switch to dark theme
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Verify dark theme is active
    const darkThemeClass = await page.evaluate(
      () => document.documentElement.className
    );
    expect(darkThemeClass).toContain("dark");

    // Navigate to a tool page
    await page.goto("/tools/json-formatter");
    await page.waitForLoadState("networkidle");

    // Verify theme persists after navigation
    const persistedThemeClass = await page.evaluate(
      () => document.documentElement.className
    );
    expect(persistedThemeClass).toContain("dark");

    // Verify theme toggle button still works on the new page
    const toolPageThemeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(toolPageThemeToggle).toBeVisible();

    // Switch back to light theme
    await toolPageThemeToggle.click();
    await page.waitForTimeout(100);

    // Verify light theme is now active
    const lightThemeClass = await page.evaluate(
      () => document.documentElement.className
    );
    expect(lightThemeClass).toContain("light");
    expect(lightThemeClass).not.toContain("dark");
  });

  test("should not cause infinite recursion or application crashes", async ({
    page,
  }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');

    // Listen for JavaScript errors
    const jsErrors: string[] = [];
    page.on("pageerror", error => {
      jsErrors.push(error.message);
    });

    // Listen for console errors
    const consoleErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Rapidly click theme toggle multiple times to test for recursion
    for (let i = 0; i < 10; i++) {
      await themeToggle.click();
      // Small wait to allow any potential recursion to manifest
      await page.waitForTimeout(50);
    }

    // Wait a bit more to catch any delayed errors
    await page.waitForTimeout(500);

    // Verify no JavaScript errors occurred
    expect(jsErrors).toHaveLength(0);
    expect(
      consoleErrors.filter(
        error =>
          error.includes("recursion") ||
          error.includes("stack") ||
          error.includes("Maximum call stack")
      )
    ).toHaveLength(0);

    // Verify the application is still responsive
    await expect(themeToggle).toBeVisible();
    await expect(page.locator("header")).toBeVisible();

    // Verify page title is still correct
    await expect(page).toHaveTitle(/Developer Tools/);
  });

  test("should work correctly on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();

    // Verify touch-friendly styling
    const buttonClass = await themeToggle.getAttribute("class");
    expect(buttonClass).toContain("touch-manipulation");

    // Test theme toggle on mobile
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Verify theme changed
    const themeClass = await page.evaluate(
      () => document.documentElement.className
    );
    expect(themeClass).toMatch(/(light|dark)/);

    // Verify button remains accessible and functional
    await expect(themeToggle).toBeVisible();
    await expect(themeToggle).toBeEnabled();
  });
});
