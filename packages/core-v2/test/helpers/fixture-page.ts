import fs from "node:fs/promises";
import type { Page } from "@playwright/test";
import { buildNatcoreCss } from "./build-natcore-css.ts";

const BODY_CLASS = "palette-surface";
const stylesheetCache = new Map<string, Promise<string>>();

/**
 * Loads an HTML fixture (e.g. `new URL("./dialog.e2e.html", import.meta.url)`)
 * into the page, styled by natcore compiled from source plus the Tailwind
 * utilities the fixture's markup uses.
 */
export async function loadFixture(page: Page, fixture: URL) {
  await mountHtml(page, await fs.readFile(fixture, "utf8"));
}

/**
 * Mounts `html` as the page body with the natcore stylesheet it needs. The body
 * gets `palette-surface`, like an app root, so tone-based surfaces (`card-*`)
 * have colors. The page is rendered with the stylesheet already in `<head>`,
 * like a real page, so nothing transitions from unstyled to styled on load.
 */
export async function mountHtml(page: Page, html: string) {
  await page.setContent(documentFor(html));
  // Read candidates from the parsed DOM, so every valid way of writing a class
  // attribute (quoted, unquoted, spaced, entity-encoded) is picked up.
  const candidates = await page.evaluate(() => [
    ...new Set(
      [...document.querySelectorAll("[class]")].flatMap((el) => [
        ...el.classList,
      ]),
    ),
  ]);
  const css = await stylesheetFor(candidates);
  await page.setContent(documentFor(html, css));
}

function documentFor(html: string, css = "") {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css.replaceAll("</style", "<\\/style")}</style></head><body class="${BODY_CLASS}">${html}</body></html>`;
}

function stylesheetFor(candidates: string[]) {
  const key = [...candidates].sort().join(" ");
  let cached = stylesheetCache.get(key);
  if (!cached) {
    cached = buildNatcoreCss(candidates).then((root) => root.toString());
    stylesheetCache.set(key, cached);
  }
  return cached;
}
