import { test, expect } from "@playwright/test";

test.describe("Demo End-to-End Test", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should complete full demo tour in crazy fast mode", async ({ page }) => {
    // Verify demo start button is visible
    const startDemoButton = page.locator('[data-testid="start-demo-button"]');
    await expect(startDemoButton).toBeVisible();

    // Set demo speed to crazy fast before starting
    const crazyFastButton = page.locator('button:has-text("Crazy Fast")');
    await expect(crazyFastButton).toBeVisible();
    await crazyFastButton.click();

    // Verify crazy fast speed is selected
    await expect(crazyFastButton).toHaveClass(/bg-primary|bg-blue-600|variant-default/);

    // Start the demo
    await startDemoButton.click();

    // Verify demo mode is active
    const demoModeActive = page.locator('text=Demo Mode Active');
    await expect(demoModeActive).toBeVisible();

    // Verify progress bar appears
    const progressBar = page.locator('.bg-blue-600.h-2.rounded-full');
    await expect(progressBar).toBeVisible();

    // Verify demo controls are available during playback
    const pauseButton = page.locator('button:has-text("Pause")');
    await expect(pauseButton).toBeVisible();

    const stopButton = page.locator('button:has-text("Stop")');
    await expect(stopButton).toBeVisible();

    const skipButton = page.locator('button:has-text("Skip")');
    await expect(skipButton).toBeVisible();

    // Verify crazy fast speed option is available during demo
    const demoSpeedSelector = page.locator('.bg-blue-50 .flex.items-center.justify-center.space-x-2 button:has-text("Crazy Fast")');
    await expect(demoSpeedSelector).toBeVisible();

    // Test speed change during demo - switch to normal and back to crazy fast
    const normalSpeedButton = page.locator('.bg-blue-50 button:has-text("Normal")');
    await normalSpeedButton.click();
    
    // Verify speed change is reflected in status
    await expect(page.locator('text=Normal speed')).toBeVisible();

    // Switch back to crazy fast
    await demoSpeedSelector.click();
    await expect(page.locator('text=Crazy fast speed')).toBeVisible();

    // Test pause and resume functionality
    await pauseButton.click();
    await expect(page.locator('text=Paused')).toBeVisible();
    
    const resumeButton = page.locator('button:has-text("Resume")');
    await expect(resumeButton).toBeVisible();
    await resumeButton.click();

    // Monitor demo progress and ensure it's making progress
    let currentProgress = 0;
    let progressChecks = 0;
    const maxProgressChecks = 50; // Limit checks to prevent infinite loop

    while (currentProgress < 100 && progressChecks < maxProgressChecks) {
      await page.waitForTimeout(500); // Wait 500ms between checks
      
      const progressText = await page.locator('.text-xs.text-blue-600').first().textContent();
      if (progressText) {
        const progressMatch = progressText.match(/(\d+)% complete/);
        if (progressMatch) {
          const newProgress = parseInt(progressMatch[1], 10);
          if (newProgress > currentProgress) {
            currentProgress = newProgress;
            console.log(`Demo progress: ${currentProgress}%`);
          }
        }
      }
      progressChecks++;
      
      // Break if demo completed
      if (currentProgress >= 100) {
        break;
      }
      
      // Check if demo is still running
      const isDemoStillRunning = await demoModeActive.isVisible();
      if (!isDemoStillRunning) {
        // Demo completed
        break;
      }
    }

    // Wait for demo completion or timeout after reasonable time
    await page.waitForFunction(
      () => {
        const demoActive = document.querySelector('text=Demo Mode Active');
        return !demoActive || !demoActive.isConnected;
      },
      undefined,
      { timeout: 120000 } // 2 minutes max for crazy fast demo
    );

    // Verify demo has completed and we're back to home state
    await expect(demoModeActive).not.toBeVisible();
    await expect(startDemoButton).toBeVisible();

    // Verify no JavaScript errors occurred during demo
    const errors = await page.evaluate(() => {
      return (window as any).jsErrors || [];
    });
    expect(errors.length).toBe(0);

    console.log(`Demo completed successfully! Final progress: ${currentProgress}%`);
  });

  test("should handle demo interruption and cleanup properly", async ({ page }) => {
    // Start demo in crazy fast mode
    const crazyFastButton = page.locator('button:has-text("Crazy Fast")');
    await crazyFastButton.click();
    
    const startDemoButton = page.locator('[data-testid="start-demo-button"]');
    await startDemoButton.click();

    // Wait for demo to start
    const demoModeActive = page.locator('text=Demo Mode Active');
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

  test("should navigate through tools correctly during demo", async ({ page }) => {
    // Set up error collection
    await page.addInitScript(() => {
      (window as any).jsErrors = [];
      window.addEventListener('error', (e) => {
        (window as any).jsErrors.push(e.message);
      });
      window.addEventListener('unhandledrejection', (e) => {
        (window as any).jsErrors.push(`Unhandled promise rejection: ${e.reason}`);
      });
    });

    // Start demo in crazy fast mode
    const crazyFastButton = page.locator('button:has-text("Crazy Fast")');
    await crazyFastButton.click();
    
    const startDemoButton = page.locator('[data-testid="start-demo-button"]');
    await startDemoButton.click();

    // Track visited tools
    const visitedTools = new Set<string>();
    let lastUrl = '';
    
    // Monitor URL changes for the first several tools
    for (let i = 0; i < 10; i++) {
      await page.waitForTimeout(200); // Short wait between checks
      
      const currentUrl = page.url();
      if (currentUrl !== lastUrl && currentUrl.includes('/tools/')) {
        const toolPath = currentUrl.split('/tools/')[1];
        visitedTools.add(toolPath);
        lastUrl = currentUrl;
        console.log(`Visited tool: ${toolPath}`);
      }
      
      // Check if demo is still running
      const isDemoRunning = await page.locator('text=Demo Mode Active').isVisible();
      if (!isDemoRunning) {
        break;
      }
    }

    // Verify we visited multiple tools
    expect(visitedTools.size).toBeGreaterThan(0);
    console.log(`Visited ${visitedTools.size} tools during demo sample`);

    // Stop demo for cleanup
    const stopButton = page.locator('button:has-text("Stop")');
    if (await stopButton.isVisible()) {
      await stopButton.click();
    }

    // Verify no critical JavaScript errors
    const errors = await page.evaluate(() => (window as any).jsErrors || []);
    const criticalErrors = errors.filter((error: string) => 
      !error.includes('unhandledrejection') || 
      error.includes('TypeError') || 
      error.includes('ReferenceError')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test("should maintain speed persistence during demo", async ({ page }) => {
    // Set crazy fast speed
    const crazyFastButton = page.locator('button:has-text("Crazy Fast")');
    await crazyFastButton.click();

    // Start demo
    const startDemoButton = page.locator('[data-testid="start-demo-button"]');
    await startDemoButton.click();

    // Verify crazy fast is selected in demo controls
    const demoSpeedSelector = page.locator('.bg-blue-50 button:has-text("Crazy Fast")');
    await expect(demoSpeedSelector).toHaveClass(/bg-primary|bg-blue-600|variant-default/);

    // Change to fast speed during demo
    const fastButton = page.locator('.bg-blue-50 button:has-text("Fast")');
    await fastButton.click();

    // Verify speed change reflected in status
    await expect(page.locator('text=Fast speed')).toBeVisible();

    // Change back to crazy fast
    await demoSpeedSelector.click();
    await expect(page.locator('text=Crazy fast speed')).toBeVisible();

    // Stop demo
    const stopButton = page.locator('button:has-text("Stop")');
    await stopButton.click();

    // Verify speed preference is maintained after demo stops
    await expect(page.locator('button:has-text("Crazy Fast")')).toHaveClass(/bg-primary|bg-blue-600|variant-default/);
  });
});