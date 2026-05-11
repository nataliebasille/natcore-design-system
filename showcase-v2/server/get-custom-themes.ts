import fs from "node:fs/promises";
import path from "node:path";

export type ThemeColor =
  | string
  | {
      50: string;
      500: string;
      950: string;
    };

export type ThemeDefinition = {
  id: string;
  label: string;
  primary: ThemeColor;
  secondary: ThemeColor;
  accent: ThemeColor;
  surface: ThemeColor;
  danger: ThemeColor;
  success: ThemeColor;
};

const THEME_BLOCK_RE =
  /:root\[data-theme=(?:"([^"]+)"|'([^']+)'|([^\]]+))\]\s*\{([^}]+)\}/g;

const THEME_STATIC_BLOCK_RE = /@theme\s+static\s*\{([^}]+)\}/;

const CSS_VAR_RE = /(--theme-[\w-]+)\s*:\s*([^;]+);/g;

export async function getCustomThemes() {
  const cssPath = path.join(process.cwd(), "app", "globals.css");

  const css = await fs.readFile(cssPath, "utf8");

  return parseThemesFromCss(css);
}

export async function getNatcoreDefaultTheme(): Promise<ThemeDefinition | null> {
  const cssPath = path.join(
    process.cwd(),
    "node_modules",
    "@nataliebasille",
    "natcore-design-system",
    "dist",
    "natcore.css",
  );

  const css = await fs.readFile(cssPath, "utf8");

  return parseDefaultThemeFromCss(css);
}

export function parseDefaultThemeFromCss(css: string): ThemeDefinition | null {
  const match = css.match(THEME_STATIC_BLOCK_RE);

  if (!match) return null;

  const body = match[1]!;
  const vars: Record<string, string> = {};

  for (const varMatch of body.matchAll(CSS_VAR_RE)) {
    vars[varMatch[1]!] = varMatch[2]!.trim();
  }

  const colors: Record<string, ThemeColor> = {};

  for (const [key, value] of Object.entries(vars)) {
    const colorPart = key.slice("--theme-".length);
    const shadeMatch = colorPart.match(/^(.*)-(\d+)$/);

    if (shadeMatch) {
      const [, colorName, shade] = shadeMatch;
      const existing = colors[colorName!];
      if (existing && typeof existing === "object") {
        (existing as Record<string, string>)[shade!] = value;
      } else {
        colors[colorName!] = { [shade!]: value } as ThemeColor;
      }
    } else {
      colors[colorPart] = value;
    }
  }

  return {
    id: "",
    label: "Natcore Default",
    ...colors,
  } as ThemeDefinition;
}

export function parseThemesFromCss(css: string): ThemeDefinition[] {
  const themes: ThemeDefinition[] = [];

  for (const match of css.matchAll(THEME_BLOCK_RE)) {
    const id = match[1] ?? match[2] ?? match[3];
    const body = match[4];

    if (!id || !body) continue;

    const vars: Record<string, string> = {};

    for (const varMatch of body.matchAll(CSS_VAR_RE)) {
      vars[varMatch[1]!] = varMatch[2]!.trim();
    }

    const colors: Record<string, ThemeColor> = {};

    for (const [key, value] of Object.entries(vars)) {
      const colorPart = key.slice("--theme-".length);
      const shadeMatch = colorPart.match(/^(.*)-(\d+)$/);

      if (shadeMatch) {
        const [, colorName, shade] = shadeMatch;
        const existing = colors[colorName!];
        if (existing && typeof existing === "object") {
          (existing as Record<string, string>)[shade!] = value;
        } else {
          colors[colorName!] = { [shade!]: value } as ThemeColor;
        }
      } else {
        colors[colorPart] = value;
      }
    }

    themes.push({
      id,
      label: labelFromThemeName(id),
      ...colors,
    } as ThemeDefinition);
  }

  return themes;
}

function labelFromThemeName(name: string) {
  return name
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
