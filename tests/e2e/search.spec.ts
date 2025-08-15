import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show text diff tool when typing "text"', async ({ page }) => {
    // Find and click on search input
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();
    
    // Type "text" in search
    await searchInput.fill('text');
    
    // Wait for search results to appear
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Verify Text Diff tool is shown in results
    const textDiffResult = page.locator('[data-testid="search-result-text-diff"]');
    await expect(textDiffResult).toBeVisible();
    await expect(textDiffResult).toContainText('Text Diff');
    
    // Verify other text tools are also shown
    await expect(page.locator('[data-testid="search-result-text-counter"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-text-sort"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-text-split"]')).toBeVisible();
  });

  test('should navigate to tool when search result is clicked', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('text diff');
    
    // Wait for search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Click on Text Diff result
    const textDiffResult = page.locator('[data-testid="search-result-text-diff"]');
    await textDiffResult.click();
    
    // Verify navigation to text diff tool
    await expect(page).toHaveURL('/tools/text-diff');
    await expect(page.locator('h1')).toContainText('Text Diff');
  });

  test('should show JSON tools when typing "json"', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('json');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Verify JSON tools are shown
    await expect(page.locator('[data-testid="search-result-json-formatter"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-json-yaml-converter"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-url-to-json"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-csv-to-json"]')).toBeVisible();
  });

  test('should show time tools when typing "time"', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('time');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Verify time tools are shown
    await expect(page.locator('[data-testid="search-result-world-clock"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-timer"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-timezone-converter"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-datetime-diff"]')).toBeVisible();
  });

  test('should clear search results when input is cleared', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Type search query
    await searchInput.fill('json');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Clear search
    await searchInput.clear();
    
    // Verify results are hidden
    await expect(page.locator('[data-testid="search-results"]')).not.toBeVisible();
  });

  test('should show no results message for non-existent tools', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('nonexistenttool12345');
    
    // Wait a moment for search processing
    await page.waitForTimeout(300);
    
    // Verify no results or empty results container
    const searchResults = page.locator('[data-testid="search-results"]');
    if (await searchResults.isVisible()) {
      // If results container exists, it should be empty or show no results message
      const resultItems = searchResults.locator('[data-testid^="search-result-"]');
      await expect(resultItems).toHaveCount(0);
    }
  });

  test('should support keyboard navigation in search results', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('text');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Press arrow down to navigate
    await searchInput.press('ArrowDown');
    
    // Verify first result is highlighted/focused
    const firstResult = page.locator('[data-testid^="search-result-"]').first();
    await expect(firstResult).toHaveClass(/selected|highlighted|focused/);
    
    // Press Enter to select
    await page.keyboard.press('Enter');
    
    // Verify navigation occurred
    await expect(page).toHaveURL(/\/tools\//);
  });

  test('should close search results when clicking outside', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('json');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Click outside search area
    await page.locator('main').click();
    
    // Verify results are hidden
    await expect(page.locator('[data-testid="search-results"]')).not.toBeVisible();
  });

  test('should show encoder tools when typing "encode"', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('encode');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Verify encoder tools are shown
    await expect(page.locator('[data-testid="search-result-base64"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-url-encoder"]')).toBeVisible();
  });

  test('should support case-insensitive search', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Test uppercase
    await searchInput.fill('TEXT');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-text-diff"]')).toBeVisible();
    
    // Clear and test mixed case
    await searchInput.clear();
    await searchInput.fill('TeXt');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-text-diff"]')).toBeVisible();
  });

  test('should show converter tools when typing "convert"', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('convert');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Verify converter tools are shown
    await expect(page.locator('[data-testid="search-result-date-converter"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-unit-converter"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-timezone-converter"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-number-base-converter"]')).toBeVisible();
  });

  test('should handle search with special characters', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Test with special characters that shouldn't break search
    await searchInput.fill('json-yaml');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-json-yaml-converter"]')).toBeVisible();
  });

  test('should show generator tools when typing "generator"', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('generator');
    
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // Verify generator tools are shown
    await expect(page.locator('[data-testid="search-result-qr-generator"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-barcode-generator"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-password-generator"]')).toBeVisible();
    await expect(page.locator('[data-testid="search-result-uuid-generator"]')).toBeVisible();
  });
});