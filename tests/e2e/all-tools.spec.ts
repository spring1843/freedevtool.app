import { test, expect } from "@playwright/test";

// All tool paths extracted from toolsData
const ALL_TOOL_PATHS = [
  // Conversions
  "/tools/date-converter",
  "/tools/json-yaml-converter",
  "/tools/timezone-converter",
  "/tools/unit-converter",
  "/tools/url-to-json",
  "/tools/csv-to-json",
  "/tools/number-base-converter",

  // Formatters
  "/tools/json-formatter",
  "/tools/html-formatter",
  "/tools/yaml-formatter",
  "/tools/markdown-formatter",
  "/tools/css-formatter",
  "/tools/less-formatter",
  "/tools/time-formatter",

  // Encoders
  "/tools/base64",
  "/tools/url-encoder",
  "/tools/jwt-decoder",
  "/tools/tls-decoder",
  "/tools/md5-hash",
  "/tools/bcrypt-hash",

  // Text Tools
  "/tools/text-diff",
  "/tools/regex-tester",
  "/tools/text-sort",
  "/tools/text-counter",
  "/tools/qr-generator",
  "/tools/barcode-generator",
  "/tools/lorem-generator",
  "/tools/unicode-characters",
  "/tools/password-generator",
  "/tools/uuid-generator",
  "/tools/search-replace",
  "/tools/text-split",

  // Time Tools
  "/tools/world-clock",
  "/tools/timer",
  "/tools/stopwatch",
  "/tools/countdown",
  "/tools/datetime-diff",
  "/tools/metronome",

  // Financial Tools
  "/tools/compound-interest",
  "/tools/debt-repayment",

  // Color Tools
  "/tools/color-palette-generator",

  // Hardware
  "/tools/webcam-test",
  "/tools/microphone-test",
  "/tools/keyboard-test",

  // Browser
  "/tools/browser-info",
];

test.describe("All Tools End-to-End Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Set up error tracking for each test
    page.on("pageerror", error => {
      console.error(`JavaScript error on page: ${error.message}`);
    });

    page.on("console", msg => {
      if (msg.type() === "error") {
        console.error(`Console error: ${msg.text()}`);
      }
    });
  });

  // Test each tool individually to isolate failures
  for (const toolPath of ALL_TOOL_PATHS) {
    const toolName = toolPath.split("/").pop()?.replace(/-/g, " ") || toolPath;

    test(`${toolName} tool should load without errors`, async ({ page }) => {
      const jsErrors: string[] = [];
      const consoleErrors: string[] = [];

      // Track JavaScript errors
      page.on("pageerror", error => {
        jsErrors.push(error.message);
      });

      // Track console errors
      page.on("console", msg => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      // Navigate to the tool
      await page.goto(toolPath);

      // Wait for the page to load completely
      await page.waitForLoadState("networkidle");

      // Wait for the main content to be visible
      await page.waitForFunction(
        () => {
          const mainContent = document.querySelector("main");
          return mainContent && mainContent.children.length > 0;
        },
        undefined,
        { timeout: 10000 }
      );

      // Verify the page has loaded with expected content
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("header")).toBeVisible();

      // Check for specific tool content - each tool should have a heading
      const heading = page.locator("h1, h2, h3").first();
      await expect(heading).toBeVisible();

      // Wait a moment for any delayed JavaScript to execute
      await page.waitForFunction(() => true, undefined, { timeout: 1000 });

      // Verify no JavaScript errors occurred
      expect(
        jsErrors,
        `JavaScript errors in ${toolName}: ${jsErrors.join(", ")}`
      ).toHaveLength(0);

      // Filter out known non-critical console errors (if any)
      const criticalErrors = consoleErrors.filter(
        error =>
          !error.includes("favicon") &&
          !error.includes("404") &&
          !error.toLowerCase().includes("warning")
      );

      expect(
        criticalErrors,
        `Console errors in ${toolName}: ${criticalErrors.join(", ")}`
      ).toHaveLength(0);

      // Verify page title contains relevant information
      const pageTitle = await page.title();
      expect(pageTitle).toBeTruthy();
      expect(pageTitle.length).toBeGreaterThan(0);

      // Verify the theme toggle is present and functional
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      await expect(themeToggle).toBeVisible();

      // Quick theme toggle test to ensure no errors
      await themeToggle.click();
      await page.waitForFunction(
        () => {
          const {className} = document.documentElement;
          return className.includes("dark") || className.includes("light");
        },
        undefined,
        { timeout: 2000 }
      );

      // Verify no errors after theme toggle
      await page.waitForFunction(() => true, undefined, { timeout: 500 });
      expect(jsErrors.length).toBe(0);
    });
  }

  // Comprehensive test that visits all tools in sequence
  test("should navigate through all tools without errors", async ({ page }) => {
    const allErrors: Array<{ tool: string; error: string }> = [];

    // Track all errors across tools
    page.on("pageerror", error => {
      allErrors.push({ tool: page.url(), error: error.message });
    });

    page.on("console", msg => {
      if (msg.type() === "error") {
        allErrors.push({ tool: page.url(), error: `Console: ${msg.text()}` });
      }
    });

    // Visit each tool in sequence
    for (const toolPath of ALL_TOOL_PATHS.slice(0, 10)) {
      // Test first 10 to keep test reasonable
      await page.goto(toolPath);
      await page.waitForLoadState("networkidle");

      // Wait for content to load
      await page.waitForFunction(
        () => {
          const mainContent = document.querySelector("main");
          return mainContent && mainContent.children.length > 0;
        },
        undefined,
        { timeout: 5000 }
      );

      // Verify basic page structure
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("header")).toBeVisible();

      // Small delay to let any async operations complete
      await page.waitForFunction(() => true, undefined, { timeout: 500 });
    }

    // Filter out non-critical errors
    const criticalErrors = allErrors.filter(
      errorObj =>
        !errorObj.error.includes("favicon") &&
        !errorObj.error.includes("404") &&
        !errorObj.error.toLowerCase().includes("warning")
    );

    expect(
      criticalErrors,
      `Critical errors found: ${JSON.stringify(criticalErrors, null, 2)}`
    ).toHaveLength(0);
  });

  // Test tool discovery and navigation
  test("should be able to navigate to tools from homepage", async ({
    page,
  }) => {
    // Start from homepage
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify search functionality works
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toBeVisible();

    // Search for a tool and verify results
    await searchInput.fill("json");

    // Wait for search results to appear
    await page.waitForFunction(
      () => {
        const resultsEl = document.querySelector(
          '[data-testid="search-results"]'
        );
        return resultsEl && resultsEl.children.length > 0;
      },
      undefined,
      { timeout: 3000 }
    );

    const searchResults = page.locator('[data-testid="search-results"]');
    await expect(searchResults).toBeVisible();

    // Verify at least one search result is present
    const firstResult = searchResults
      .locator('[data-testid^="search-result-"]')
      .first();
    await expect(firstResult).toBeVisible();

    // Click the first result and verify navigation
    await firstResult.click();

    // Verify we navigated to a tool page
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/tools/");

    // Verify the tool page loaded properly
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("header")).toBeVisible();
  });
});
