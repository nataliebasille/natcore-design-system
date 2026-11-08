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
 * have colors.
 */
export async function mountHtml(page: Page, html: string) {
  const css = await stylesheetFor(html);
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body class="${BODY_CLASS}">${html}</body></html>`,
  );
}

function stylesheetFor(html: string) {
  let cached = stylesheetCache.get(html);
  if (!cached) {
    cached = buildNatcoreCss([BODY_CLASS, ...classCandidates(html)]).then(
      (root) => root.toString(),
    );
    stylesheetCache.set(html, cached);
  }
  return cached;
}

function classCandidates(html: string) {
  const candidates = new Set<string>();
  for (const [, classes = ""] of html.matchAll(/\bclass="([^"]*)"/g)) {
    for (const candidate of classes.split(/\s+/)) {
      if (candidate) candidates.add(candidate);
    }
  }
  return [...candidates];
}
