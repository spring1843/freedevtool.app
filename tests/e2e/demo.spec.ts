import { test, expect } from '@playwright/test';

test.describe('Demo End-to-End Test', () => {
  test('should complete full demo tour with very-fast speed', async ({ page }) => {
    // Set timeout for very fast demo  
    test.setTimeout(120000); // 2 minutes for safety
    
    // Navigate to the home page with increased timeout
    await page.goto('/', { timeout: 10000 });
    
    // Wait for the page to load with increased timeout
    await expect(page.locator('[data-testid="start-demo-button"]')).toBeVisible({ timeout: 10000 });
    
    // Set demo speed to "very-fast" before starting
    const veryFastButton = page.locator('button:has-text("Very Fast")');
    await veryFastButton.click();
    // Verify the button is selected (it should have different styling when active)
    await expect(veryFastButton).toHaveClass(/bg-primary|variant-default/);
    
    // Start the demo
    await page.click('[data-testid="start-demo-button"]');
    
    // Verify demo started
    await expect(page.locator('text=Demo Mode Active')).toBeVisible({ timeout: 10000 });
    
    // Track progress and verify tools load
    let previousProgress = 0;
    const toolsVisited: string[] = [];
    const maxIterations = 40; // Reduced for very fast speed (1.5s per tool)
    let iterations = 0;
    
    while (iterations < maxIterations) {
      iterations++;
      
      // Wait shorter for very-fast speed (1.5s per tool)
      await page.waitForTimeout(500);
      
      // Get current progress
      const progressElement = page.locator('[data-testid] >> text=/\\d+%/').first();
      const progressText = await progressElement.textContent();
      const currentProgress = progressText ? parseInt(progressText.replace('%', ''), 10) : 0;
      
      // Get current tool name
      const toolElement = page.locator('.bg-blue-50 .text-blue-700, .bg-blue-900\\/20 .text-blue-300').first();
      const currentTool = await toolElement.textContent();
      
      if (currentTool && !toolsVisited.includes(currentTool)) {
        toolsVisited.push(currentTool);
        // Verify the tool page loaded properly with increased timeout
        await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
        
        // Quick check for any error states
        const errorElements = page.locator('text=/error|failed|broken/i');
        const errorCount = await errorElements.count();
        if (errorCount > 0) {
          const errorText = await errorElements.first().textContent();
          throw new Error(`Tool ${currentTool} has error: ${errorText}`);
        }
        
        // Verify essential UI elements are present - check for main and footer
        await expect(page.locator('main, footer')).toHaveCount(2, { timeout: 5000 });
      }
      
      // Check if demo completed
      if (currentProgress >= 100) {
        break;
      }
      
      // Check if demo stopped unexpectedly
      const demoActive = await page.locator('text=Demo Mode Active').isVisible();
      if (!demoActive && currentProgress < 100) {
        throw new Error(`Demo stopped unexpectedly at ${currentProgress}% after visiting ${toolsVisited.length} tools`);
      }
      
      // Ensure progress is advancing (reduced threshold for fast speed)
      if (currentProgress <= previousProgress && iterations > 3) {
        // Demo might be paused or stuck, try to resume
        const resumeButton = page.locator('button:has-text("Resume")');
        if (await resumeButton.isVisible()) {
          await resumeButton.click();
        }
      }
      
      previousProgress = currentProgress;
    }
    
    // Verify demo completed successfully
    expect(toolsVisited.length).toBeGreaterThan(8); // Should visit many tools (reduced for fast speed)
    expect(previousProgress).toBe(100);
    
    // Verify we're back to a clean state after demo
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="start-demo-button"]')).toBeVisible({ timeout: 10000 });
  });
  
  test('should handle demo pause and resume correctly', async ({ page }) => {
    test.setTimeout(90000); // 1.5 minutes
    await page.goto('/', { timeout: 10000 });
    
    // Start demo with fast speed for quicker testing
    await page.click('button:has-text("Fast")');
    await page.click('[data-testid="start-demo-button"]');
    
    // Wait for demo to start
    await expect(page.locator('text=Demo Mode Active')).toBeVisible({ timeout: 10000 });
    
    // Wait a bit for demo to progress before pausing
    await page.waitForTimeout(2000);
    
    // Pause the demo
    await page.click('button:has-text("Pause")');
    await expect(page.locator('button:has-text("Resume")')).toBeVisible({ timeout: 5000 });
    
    // Verify demo is paused (progress shouldn't change) - use a more reliable selector
    const progressBefore = await page.locator('text=/\\d+%/').first().textContent({ timeout: 5000 });
    await page.waitForTimeout(2000); // Wait to verify pause
    const progressAfter = await page.locator('text=/\\d+%/').first().textContent({ timeout: 5000 });
    expect(progressBefore).toBe(progressAfter);
    
    // Resume the demo
    await page.click('button:has-text("Resume")');
    await expect(page.locator('button:has-text("Pause")')).toBeVisible({ timeout: 5000 });
    
    // Stop the demo to clean up
    await page.click('button:has-text("Stop")');
    await expect(page.locator('[data-testid="start-demo-button"]')).toBeVisible({ timeout: 10000 });
  });
  
  test('should navigate between tools properly during demo', async ({ page }) => {
    test.setTimeout(90000); // 1.5 minutes
    await page.goto('/', { timeout: 10000 });
    
    // Start demo with very fast speed
    await page.click('button:has-text("Very Fast")');
    await page.click('[data-testid="start-demo-button"]');
    
    // Wait for demo to start and visit a few tools
    await expect(page.locator('text=Demo Mode Active')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(3000); // Wait for demo to progress
    
    // Test skip functionality
    const progressBefore = await page.locator('text=/\\d+%/').first().textContent({ timeout: 5000 });
    await page.click('button:has-text("Skip")');
    await page.waitForTimeout(1000); // Wait for skip to take effect
    const progressAfter = await page.locator('text=/\\d+%/').first().textContent({ timeout: 5000 });
    
    // Progress should have advanced
    const beforeNum = parseInt(progressBefore?.replace('%', '') || '0', 10);
    const afterNum = parseInt(progressAfter?.replace('%', '') || '0', 10);
    expect(afterNum).toBeGreaterThan(beforeNum);
    
    // Stop the demo
    await page.click('button:has-text("Stop")');
    await expect(page.locator('[data-testid="start-demo-button"]')).toBeVisible({ timeout: 10000 });
  });
});