import { test, expect } from "@playwright/test";

test.describe("Demo End-to-End Test", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should handle demo interruption and cleanup properly", async ({
    page,
  }) => {
    // Start demo in crazy fast mode
    const crazyFastButton = page.locator('button:has-text("Crazy Fast")');
    await crazyFastButton.click();

    const startDemoButton = page.locator('[data-testid="start-demo-button"]');
    await startDemoButton.click();

    // Wait for demo to start
    const demoModeActive = page.locator("text=Demo Mode Active");
    await expect(demoModeActive).toBeVisible();

    // Let demo run for a short time
    await page.waitForTimeout(1000);

    // Stop the demo
    const stopButton = page.locator('button:has-text("Stop")');
    await stopButton.click();

    // Verify demo stopped and cleaned up properly
    await expect(demoModeActive).not.toBeVisible();
    await expect(startDemoButton).toBeVisible();

    // Verify we can start demo again after stopping
    await startDemoButton.click();
    await expect(demoModeActive).toBeVisible();

    // Stop again for cleanup
    await page.locator('button:has-text("Stop")').click();
  });

  test("should navigate through tools correctly during demo", async ({
    page,
  }) => {
    // Set up error collection
    await page.addInitScript(() => {
      (window as typeof window & { jsErrors: string[] }).jsErrors = [];
      window.addEventListener("error", e => {
        (window as typeof window & { jsErrors: string[] }).jsErrors.push(
          e.message
        );
      });
      window.addEventListener("unhandledrejection", e => {
        (window as typeof window & { jsErrors: string[] }).jsErrors.push(
          `Unhandled promise rejection: ${e.reason}`
        );
      });
    });

    // Start demo in crazy fast mode
    const crazyFastButton = page.locator('button:has-text("Crazy Fast")');
    await crazyFastButton.click();

    const startDemoButton = page.locator('[data-testid="start-demo-button"]');
    await startDemoButton.click();

    // Track visited tools
    const visitedTools = new Set<string>();
    let lastUrl = "";

    // Monitor URL changes for a longer period to visit more tools
    let checksWithoutNewTool = 0;
    const maxChecksWithoutNewTool = 25;

    while (
      checksWithoutNewTool < maxChecksWithoutNewTool &&
      visitedTools.size < 15
    ) {
      await page.waitForTimeout(150); // Short wait between checks

      const currentUrl = page.url();
      if (currentUrl !== lastUrl && currentUrl.includes("/tools/")) {
        const toolPath = currentUrl.split("/tools/")[1];
        if (toolPath && !visitedTools.has(toolPath)) {
          visitedTools.add(toolPath);
          lastUrl = currentUrl;
          console.warn(
            `Visited tool: ${toolPath} (${visitedTools.size} total)`
          );
          checksWithoutNewTool = 0;
        }
      } else {
        checksWithoutNewTool++;
      }

      // Check if demo is still running
      const isDemoRunning = await page
        .locator("text=Demo Mode Active")
        .isVisible();
      if (!isDemoRunning) {
        break;
      }
    }

    // Verify we visited a substantial number of tools
    expect(visitedTools.size).toBeGreaterThan(5);
    console.warn(
      `Visited ${visitedTools.size} tools during demo navigation test`
    );
    console.warn(
      `Tools visited: ${Array.from(visitedTools).sort().join(", ")}`
    );

    // Stop demo for cleanup
    const stopButton = page.locator('button:has-text("Stop")');
    if (await stopButton.isVisible()) {
      await stopButton.click();
    }

    // Verify no critical JavaScript errors
    const errors = await page.evaluate(
      () => (window as typeof window & { jsErrors?: string[] }).jsErrors || []
    );
    const criticalErrors = errors.filter(
      (error: string) =>
        !error.includes("unhandledrejection") ||
        error.includes("TypeError") ||
        error.includes("ReferenceError")
    );
    expect(criticalErrors.length).toBe(0);
  });
});
