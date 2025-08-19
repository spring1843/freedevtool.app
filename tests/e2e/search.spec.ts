import { test, expect } from "@playwright/test";

test.describe("Search Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test('should show text diff tool when typing "text diff"', async ({
    page,
  }) => {
    // Find and click on homepage search input
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();

    // Type "text" in search
    await searchInput.fill("text diff");

    // Wait for search results to appear
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // Verify Text Diff tool is shown in results
    const textDiffResult = page.locator(
      '[data-testid="search-result-text-diff"]'
    );
    await expect(textDiffResult).toBeVisible();
    await expect(textDiffResult).toContainText("Text Diff");
  });

  test("should navigate to tool when search result is clicked", async ({
    page,
  }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill("text diff");

    // Wait for search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // Click on Text Diff result
    const textDiffResult = page.locator(
      '[data-testid="search-result-text-diff"]'
    );
    await textDiffResult.click();

    // Verify navigation to text diff tool
    await expect(page).toHaveURL("/tools/text-diff");
    await expect(page.locator("h2")).toContainText("Text Diff");
  });

  test("should clear search results when input is cleared", async ({
    page,
  }) => {
    const searchInput = page.locator('[data-testid="search-input"]');

    // Type search query
    await searchInput.fill("json");
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // Clear search
    await searchInput.clear();

    // Verify results are hidden
    await expect(
      page.locator('[data-testid="search-results"]')
    ).not.toBeVisible();
  });

  test("should show no results message for non-existent tools", async ({
    page,
  }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill("nonexistenttool12345");

    // Wait for search results to appear or disappear
    const searchResults = page.locator('[data-testid="search-results"]');

    // Wait for either results to appear or to confirm no results exist
    await page.waitForFunction(
      () => {
        const resultsEl = document.querySelector(
          '[data-testid="search-results"]'
        );
        if (!resultsEl) return true; // No results container = no results

        const resultItems = resultsEl.querySelectorAll(
          '[data-testid^="search-result-"]'
        );
        return resultItems.length === 0; // Empty results = search processed
      },
      undefined,
      { timeout: 3000 }
    );

    // Verify no results or empty results container
    if (await searchResults.isVisible()) {
      // If results container exists, it should be empty or show no results message
      const resultItems = searchResults.locator(
        '[data-testid^="search-result-"]'
      );
      await expect(resultItems).toHaveCount(0);
    }
  });

  test("should close search results when clicking outside", async ({
    page,
  }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill("json");

    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // Click outside search area
    await page.locator("main").click();

    // Verify results are hidden
    await expect(
      page.locator('[data-testid="search-results"]')
    ).not.toBeVisible();
  });

  test("should support case-insensitive search", async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');

    // Test uppercase
    await searchInput.fill("TEXT");
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="search-result-text-diff"]')
    ).toBeVisible();

    // Clear and test mixed case
    await searchInput.clear();
    await searchInput.fill("TeXt");
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="search-result-text-diff"]')
    ).toBeVisible();
  });

  test('should show converter tools when typing "convert"', async ({
    page,
  }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill("convert");

    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // Verify converter tools are shown
    await expect(
      page.locator('[data-testid="search-result-date-converter"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="search-result-unit-converter"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="search-result-timezone-converter"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="search-result-number-base-converter"]')
    ).toBeVisible();
  });

  test('should show generator tools when typing "generator"', async ({
    page,
  }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill("generator");

    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();

    // Verify generator tools are shown
    await expect(
      page.locator('[data-testid="search-result-qr-generator"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="search-result-barcode-generator"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="search-result-password-generator"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="search-result-uuid-generator"]')
    ).toBeVisible();
  });
});
