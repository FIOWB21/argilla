import { tmpdir } from "os";
import { join } from "path";
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e/manual",
  testMatch: "annotation.manual.ts",
  timeout: 0,
  workers: 1,
  retries: 0,
  reporter: "line",
  outputDir: join(tmpdir(), "argilla-manual-session"),
  preserveOutput: "never",
  use: {
    baseURL: "http://localhost:3000",
    browserName: "chromium",
    headless: false,
    viewport: { width: 1500, height: 1000 },
    serviceWorkers: "block",
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
