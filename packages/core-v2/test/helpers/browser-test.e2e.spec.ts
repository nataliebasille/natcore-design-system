import { browsers, expect, test } from "./browser-test.ts";

test("runs in every browser", ({ browserName }) => {
  expect(["chromium", "firefox"]).toContain(browserName);
});

test(
  "runs only in the listed browser",
  browsers("firefox"),
  ({ browserName }) => {
    expect(browserName).toBe("firefox");
  },
);

test(
  "runs only in the listed subset of browsers",
  browsers("chromium", "webkit"),
  ({ browserName }) => {
    expect(browserName).toBe("chromium");
  },
);
