import { test, expect } from "@playwright/test";

test.describe("GraphQL Formatter Tool", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/tools/graphql-formatter");
  });

  test("should load GraphQL formatter page without errors", async ({
    page,
  }) => {
    // Wait for the page to load completely
    await page.waitForSelector('[data-testid="graphql-input"]');

    // Check that the page loaded without JavaScript errors
    const jsErrors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        jsErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(1000);

    // Should not have any JavaScript errors
    expect(jsErrors).toHaveLength(0);

    // Should display the correct title
    await expect(page).toHaveTitle(/GraphQL Formatter/);

    // Should have the main elements
    await expect(page.locator("h2")).toContainText("GraphQL Formatter");
    await expect(page.locator('[data-testid="graphql-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="graphql-output"]')).toBeVisible();
  });

  test("should format GraphQL schema correctly", async ({ page }) => {
    const input = "type User{name:String!age:Int}";

    await page.fill('[data-testid="graphql-input"]', input);
    await page.click("text=Format GraphQL");

    // Wait for formatting to complete
    await page.waitForTimeout(500);

    const output = await page.inputValue('[data-testid="graphql-output"]');
    expect(output).toContain("type User");
    expect(output).toContain("name:");
    expect(output).toContain("age:");
  });

  test("should format GraphQL queries correctly", async ({ page }) => {
    const input = "query GetUser{user(id:1){name age}}";

    await page.fill('[data-testid="graphql-input"]', input);
    await page.click("text=Format GraphQL");

    // Wait for formatting to complete
    await page.waitForTimeout(500);

    const output = await page.inputValue('[data-testid="graphql-output"]');
    expect(output).toContain("query GetUser");
    expect(output).toContain("user(id: 1)");
  });

  test("should reset to default content", async ({ page }) => {
    // Clear the input
    await page.fill('[data-testid="graphql-input"]', "");

    // Click reset
    await page.click("text=Reset");

    // Should have default content back
    const inputValue = await page.inputValue('[data-testid="graphql-input"]');
    expect(inputValue).toContain("type User");
    expect(inputValue).toContain("type Post");
    expect(inputValue).toContain("type Query");
    expect(inputValue).toContain("type Mutation");
  });
});
