#!/usr/bin/env node

import fs from "fs";
import path from "path";

// All tool paths from toolsData
const ALL_TOOLS = [
  // Conversions
  { name: "Date Converter", path: "/tools/date-converter" },
  { name: "JSON ↔ YAML", path: "/tools/json-yaml-converter" },
  { name: "Timezone Converter", path: "/tools/timezone-converter" },
  { name: "Unit Converter", path: "/tools/unit-converter" },
  { name: "URL to JSON", path: "/tools/url-to-json" },
  { name: "CSV to JSON", path: "/tools/csv-to-json" },
  { name: "Number Base Converter", path: "/tools/number-base-converter" },

  // Formatters
  { name: "JSON Formatter", path: "/tools/json-formatter" },
  { name: "HTML Beautifier", path: "/tools/html-formatter" },
  { name: "YAML Formatter", path: "/tools/yaml-formatter" },
  { name: "Markdown Formatter", path: "/tools/markdown-formatter" },
  { name: "CSS Formatter", path: "/tools/css-formatter" },
  { name: "LESS Formatter", path: "/tools/less-formatter" },
  { name: "Time Formatter", path: "/tools/time-formatter" },

  // Encoders
  { name: "Base64 Encoder", path: "/tools/base64" },
  { name: "URL Encoder", path: "/tools/url-encoder" },
  { name: "JWT Decoder", path: "/tools/jwt-decoder" },
  { name: "TLS Certificate Decoder", path: "/tools/tls-decoder" },
  { name: "MD5 Hash", path: "/tools/md5-hash" },
  { name: "BCrypt Hash", path: "/tools/bcrypt-hash" },

  // Text Tools
  { name: "Text Diff", path: "/tools/text-diff" },
  { name: "Regex Tester", path: "/tools/regex-tester" },
  { name: "Text Sorter", path: "/tools/text-sort" },
  { name: "Word Counter", path: "/tools/text-counter" },
  { name: "QR Generator", path: "/tools/qr-generator" },
  { name: "Barcode Generator", path: "/tools/barcode-generator" },
  { name: "Lorem Generator", path: "/tools/lorem-generator" },
  { name: "Unicode Characters", path: "/tools/unicode-characters" },
  { name: "Password Generator", path: "/tools/password-generator" },
  { name: "UUID Generator", path: "/tools/uuid-generator" },
  { name: "Search & Replace", path: "/tools/search-replace" },
  { name: "Text Split", path: "/tools/text-split" },

  // Time Tools
  { name: "World Clock", path: "/tools/world-clock" },
  { name: "Timer", path: "/tools/timer" },
  { name: "Stopwatch", path: "/tools/stopwatch" },
  { name: "Countdown", path: "/tools/countdown" },
  { name: "Date/Time Difference", path: "/tools/datetime-diff" },
  { name: "Metronome", path: "/tools/metronome" },

  // Financial Tools
  { name: "Compound Interest", path: "/tools/compound-interest" },
  { name: "Debt Repayment", path: "/tools/debt-repayment" },

  // Color Tools
  { name: "Color Palette Generator", path: "/tools/color-palette-generator" },

  // Hardware
  { name: "Camera Test", path: "/tools/webcam-test" },
  { name: "Microphone Test", path: "/tools/microphone-test" },
  { name: "Keyboard Test", path: "/tools/keyboard-test" },

  // Browser
  { name: "Browser Info", path: "/tools/browser-info" },
];

// Template for individual tool test
function generateTestTemplate(toolName, toolPath) {
  const fileName = toolPath.split("/").pop();

  return `import { test, expect } from "@playwright/test";

test.describe("${toolName} Tool", () => {
  test.beforeEach(async ({ page }) => {
    // Track JavaScript and console errors
    page.on("pageerror", (error) => {
      console.error(\`JavaScript error: \${error.message}\`);
    });
    
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error(\`Console error: \${msg.text()}\`);
      }
    });
  });

  test("should load without errors", async ({ page }) => {
    const jsErrors: string[] = [];
    const consoleErrors: string[] = [];
    
    // Track errors
    page.on("pageerror", (error) => {
      jsErrors.push(error.message);
    });
    
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    
    // Navigate to the tool
    await page.goto("${toolPath}");
    await page.waitForLoadState("networkidle");
    
    // Wait for content to load
    await page.waitForFunction(
      () => {
        const mainContent = document.querySelector("main");
        return mainContent && mainContent.children.length > 0;
      },
      undefined,
      { timeout: 10000 }
    );
    
    // Verify basic page structure
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("header")).toBeVisible();
    
    // Verify tool-specific content
    const heading = page.locator("h1, h2, h3").first();
    await expect(heading).toBeVisible();
    
    // Verify theme toggle works
    const themeToggle = page.locator('[data-testid="theme-toggle"]');
    await expect(themeToggle).toBeVisible();
    await themeToggle.click();
    
    // Wait for theme change
    await page.waitForFunction(
      () => {
        const className = document.documentElement.className;
        return className.includes("dark") || className.includes("light");
      },
      undefined,
      { timeout: 2000 }
    );
    
    // Wait for any delayed operations
    await page.waitForFunction(() => true, undefined, { timeout: 1000 });
    
    // Filter critical errors
    const criticalConsoleErrors = consoleErrors.filter(error => 
      !error.includes("favicon") && 
      !error.includes("404") &&
      !error.toLowerCase().includes("warning")
    );
    
    // Verify no errors occurred
    expect(jsErrors, \`JavaScript errors: \${jsErrors.join(", ")}\`).toHaveLength(0);
    expect(criticalConsoleErrors, \`Console errors: \${criticalConsoleErrors.join(", ")}\`).toHaveLength(0);
    
    // Verify page title
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    expect(pageTitle.length).toBeGreaterThan(0);
  });
});`;
}

// Create tests directory if it doesn't exist
const testsDir = path.join(process.cwd(), "tests", "e2e", "tools");
if (!fs.existsSync(testsDir)) {
  fs.mkdirSync(testsDir, { recursive: true });
}

// Generate test files for all tools
ALL_TOOLS.forEach(tool => {
  const fileName = tool.path.split("/").pop() + ".spec.ts";
  const filePath = path.join(testsDir, fileName);

  // Only create if file doesn't exist
  if (!fs.existsSync(filePath)) {
    const testContent = generateTestTemplate(tool.name, tool.path);
    fs.writeFileSync(filePath, testContent);
    console.log(`Created test file: ${fileName}`);
  } else {
    console.log(`Test file already exists: ${fileName}`);
  }
});

console.log(`\nGenerated ${ALL_TOOLS.length} individual tool test files.`);
