import { test, expect } from "@playwright/test";
import { getToolsCount, getAllToolPaths } from "../../client/src/data/tools"; // Adjust import based on your project structure

test.describe("Demo End-to-End Test", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should handle demo interruption and cleanup properly", async ({
    page,
  }) => {
    // Start demo
    const startDemoButton = page.locator('[data-testid="start-demo-button"]');
    await startDemoButton.click();

    // Wait for demo to start
    const demoModeActive = page.locator("text=Demo Mode Active");
    await expect(demoModeActive).toBeVisible();

    // Change to crazy fast speed after demo starts
    const speedSelect = page.locator('[role="combobox"]').first();
    await speedSelect.click();
    const crazyFastOption = page.locator(
      '[role="option"]:has-text("Crazy Fast")'
    );
    await crazyFastOption.click();

    // Let demo run for a short time
    await page.waitForTimeout(3000);

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

    // Start demo
    const startDemoButton = page.locator('[data-testid="start-demo-button"]');
    await startDemoButton.click();

    // Wait for demo to start then set crazy fast speed
    await page.waitForSelector("text=Demo Mode Active");
    const speedSelect = page.locator('[role="combobox"]').first();
    await speedSelect.click();
    const crazyFastOption = page.locator(
      '[role="option"]:has-text("Crazy Fast")'
    );
    await crazyFastOption.click();

    // Track visited tools
    const visitedTools = new Set<string>();
    let lastUrl = "";

    // Monitor URL changes until demo completes
    while (true) {
      const currentUrl = page.url();

      // Check if we're back at homepage (demo completed)
      if (
        currentUrl.endsWith("/") &&
        !currentUrl.includes("/tools/") &&
        visitedTools.size > 0
      ) {
        console.warn("Demo completed - returned to homepage");
        break;
      }

      if (currentUrl !== lastUrl && currentUrl.includes("/tools/")) {
        // Extract tool path and remove query parameters
        const toolPath = currentUrl.split("/tools/")[1]?.split("?")[0];
        if (toolPath && !visitedTools.has(toolPath)) {
          visitedTools.add(toolPath);
        }
      }

      lastUrl = currentUrl;

      // Check if demo is still running
      const isDemoRunning = await page
        .locator("text=Demo Mode Active")
        .isVisible();
      if (!isDemoRunning) {
        break;
      }
    }

    // Get all available tool paths and find missing ones
    const allToolPaths = getAllToolPaths();
    const visitedToolsArray = Array.from(visitedTools);
    const missingTools = allToolPaths.filter(path => {
      const toolName = path.replace("/tools/", "");
      // Check if any visited tool URL contains this tool name
      return !visitedToolsArray.some(visitedTool =>
        visitedTool.includes(toolName)
      );
    });

    const toolCount = getToolsCount();
    expect(
      visitedTools.size,
      `missing tools visits during demo: ${missingTools.join(", ")}`
    ).toBeGreaterThan(toolCount - 5);

    console.warn(`Visited tools (${visitedTools.size} total)`);

    // Verify we're back at homepage with explicit URL check
    const finalUrl = page.url();
    expect(finalUrl.endsWith("/")).toBeTruthy();
    expect(finalUrl).not.toContain("/tools/");

    // Additional check to ensure homepage content is visible
    await expect(
      page.locator('[data-testid="start-demo-button"]')
    ).toBeVisible();

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
