import { defineConfig, devices } from "@playwright/test";

// `*.e2e.spec.ts` files sit next to the source they cover and mount their own
// HTML fixtures (see test/helpers/fixture-page.ts), so no web server is needed.
export default defineConfig({
  testDir: ".",
  testMatch: "**/*.e2e.spec.ts",
  testIgnore: ["**/node_modules/**", "**/dist/**"],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
});
