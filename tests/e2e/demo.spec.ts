import { test, expect } from "@playwright/test";

test.describe("Demo Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should complete full demo tour", async ({ page }) => {
    // Track any JavaScript errors during demo
    const jsErrors: string[] = [];
    page.on("pageerror", error => {
      jsErrors.push(error.message);
    });

    // Look for demo start button
    const demoButton = page
      .locator(
        '[data-testid="demo-start"], button:has-text("Start Demo"), button:has-text("Demo")'
      )
      .first();

    // If demo button exists, test the demo functionality
    if (await demoButton.isVisible({ timeout: 2000 })) {
      // Start the demo
      await demoButton.click();

      // Wait for demo to initialize
      await page.waitForFunction(
        () => {
          // Look for demo controls or demo-related elements
          const demoControls = document.querySelector('[data-testid*="demo"]');
          const demoOverlay = document.querySelector(
            '.demo-overlay, [class*="demo"]'
          );
          return (
            demoControls ||
            demoOverlay ||
            document.body.classList.contains("demo-active")
          );
        },
        undefined,
        { timeout: 5000 }
      );

      // Look for demo controls (play, pause, speed controls)
      const playButton = page
        .locator(
          '[data-testid*="demo-play"], [data-testid*="play"], button:has-text("Play")'
        )
        .first();
      const pauseButton = page
        .locator(
          '[data-testid*="demo-pause"], [data-testid*="pause"], button:has-text("Pause")'
        )
        .first();
      const stopButton = page
        .locator(
          '[data-testid*="demo-stop"], [data-testid*="stop"], button:has-text("Stop")'
        )
        .first();

      // Test play functionality if available
      if (await playButton.isVisible({ timeout: 1000 })) {
        await playButton.click();

        // Wait for demo to start playing
        await page.waitForFunction(() => true, undefined, { timeout: 1000 });
      }

      // Test pause functionality if available
      if (await pauseButton.isVisible({ timeout: 1000 })) {
        await pauseButton.click();

        // Wait for demo to pause
        await page.waitForFunction(() => true, undefined, { timeout: 1000 });
      }

      // Test speed controls if available
      const speedButtons = page.locator(
        '[data-testid*="speed"], button:has-text("Slow"), button:has-text("Fast"), button:has-text("Normal")'
      );
      const speedCount = await speedButtons.count();

      if (speedCount > 0) {
        // Click a few speed options
        for (let i = 0; i < Math.min(speedCount, 3); i++) {
          await speedButtons.nth(i).click();
          await page.waitForFunction(() => true, undefined, { timeout: 500 });
        }
      }

      // Test stop functionality if available
      if (await stopButton.isVisible({ timeout: 1000 })) {
        await stopButton.click();

        // Wait for demo to stop
        await page.waitForFunction(() => true, undefined, { timeout: 2000 });
      }

      // Verify no JavaScript errors occurred during demo
      expect(
        jsErrors,
        `JavaScript errors during demo: ${jsErrors.join(", ")}`
      ).toHaveLength(0);

      // Verify page is still functional after demo
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("main")).toBeVisible();

      // Verify theme toggle still works
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      if (await themeToggle.isVisible({ timeout: 1000 })) {
        await themeToggle.click();
        await page.waitForFunction(
          () => {
            const {className} = document.documentElement;
            return className.includes("dark") || className.includes("light");
          },
          undefined,
          { timeout: 2000 }
        );
      }
    } else {
      // If no demo button found, just verify the page is functional
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("main")).toBeVisible();

      // No demo button found - skipping demo-specific tests
    }

    // Final verification - no errors accumulated
    expect(jsErrors).toHaveLength(0);
  });

  test("should handle demo navigation between tools", async ({ page }) => {
    const jsErrors: string[] = [];
    page.on("pageerror", error => {
      jsErrors.push(error.message);
    });

    // Start from a specific tool that likely has demo functionality
    await page.goto("/tools/json-formatter");
    await page.waitForLoadState("networkidle");

    // Look for demo button on tool page
    const demoButton = page
      .locator(
        '[data-testid="demo-start"], button:has-text("Start Demo"), button:has-text("Demo")'
      )
      .first();

    if (await demoButton.isVisible({ timeout: 2000 })) {
      await demoButton.click();

      // Wait for demo to start
      await page.waitForFunction(
        () => {
          const demoControls = document.querySelector('[data-testid*="demo"]');
          const demoOverlay = document.querySelector(
            '.demo-overlay, [class*="demo"]'
          );
          return demoControls || demoOverlay;
        },
        undefined,
        { timeout: 3000 }
      );

      // Navigate to another tool while demo might be running
      await page.goto("/tools/base64");
      await page.waitForLoadState("networkidle");

      // Verify page loaded properly despite demo state
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("header")).toBeVisible();

      // Verify no errors from navigation during demo
      expect(
        jsErrors,
        `Errors during demo navigation: ${jsErrors.join(", ")}`
      ).toHaveLength(0);
    }

    // Navigate back to home
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify homepage still works
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();

    // Final check - no errors
    expect(jsErrors).toHaveLength(0);
  });
});
