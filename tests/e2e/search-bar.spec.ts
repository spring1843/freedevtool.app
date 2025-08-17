import { test, expect } from '@playwright/test';

test.describe('Search Bar Visibility', () => {
  test('should display search bar in top right of screen', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for the search bar in the top menu
    const searchBar = page.locator('[data-testid="search-input"]');
    
    // Check if search bar is visible
    await expect(searchBar).toBeVisible();
    
    // Verify it's positioned in the top right area of the screen
    const searchBarBox = await searchBar.boundingBox();
    const viewportSize = page.viewportSize();
    
    if (searchBarBox && viewportSize) {
      // Check that search bar is in the upper portion of the screen (top 20%)
      expect(searchBarBox.y).toBeLessThan(viewportSize.height * 0.2);
      
      // Check that search bar is in the right portion of the screen (right 50%)
      expect(searchBarBox.x).toBeGreaterThan(viewportSize.width * 0.5);
    }
    
    // Verify search bar is interactive
    await expect(searchBar).toBeEnabled();
    
    // Test that we can focus on the search bar
    await searchBar.click();
    await expect(searchBar).toBeFocused();
  });
});