"use client";

import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ChevronDownIcon, MoonIcon, SunIcon } from "./icons";
import type { getCustomThemes, ThemeColor } from "@/server/get-custom-themes";
import { THEME_STORAGE_KEY } from "@/utlls/constants";

export function ThemeToggle({
  className,
  customThemes,
}: {
  className?: string;
  customThemes?: Awaited<ReturnType<typeof getCustomThemes>>;
}) {
  const currentTheme =
    typeof window !== "undefined" ?
      document.documentElement.dataset.theme
    : undefined;
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

  const { resolvedTheme: resolvedLightOrDark, setTheme: setLightDark } =
    useTheme();
  const isDark = resolvedLightOrDark === "dark";
  const title =
    resolvedLightOrDark === "light" ?
      "Light theme (click for dark)"
    : "Dark theme (click for light)";

  const cycleTheme = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      evt.stopPropagation();
      setLightDark(isDark ? "light" : "dark");
    },
    [resolvedLightOrDark, setLightDark],
  );

  const toggleThemeSelector = useCallback(() => {
    setIsThemeSelectorOpen((open) => !open);
  }, []);

  const setTheme = useCallback((theme: string) => {
    if (!theme) {
      localStorage.removeItem(THEME_STORAGE_KEY);
      document.documentElement.dataset.theme = "";
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      document.documentElement.dataset.theme = theme;
    }
    setIsThemeSelectorOpen(false);
  }, []);

  return (
    <div className={twMerge("relative ml-auto w-max", className)}>
      <button
        className="inline-flex btn-ghost/surface transform-none items-center-safe [--btn-px:0.25rem] [--btn-py:0.25rem]"
        onClick={toggleThemeSelector}
      >
        {/* The server can't know light/dark, so the thumb and icon follow the
            <html> scheme class (set before first paint by next-themes)
            instead of React state; otherwise the toggle would pop in and then
            animate to dark after hydration. */}
        <label
          suppressHydrationWarning
          className={twMerge(
            "toggle-outline/surface toggle-on:text-white toggle-off:palette-surface",
            className,
          )}
          title={title}
          aria-label={title}
        >
          <input
            suppressHydrationWarning
            type="checkbox"
            checked={isDark}
            onChange={cycleTheme}
          />
          <span
            data-slot="thumb"
            className="flex items-center justify-center dark:[transform:translateX(var(--toggle-h))]"
          >
            <MoonIcon className="hidden h-3 w-3 dark:block" />
            <SunIcon className="h-3 w-3 dark:hidden" />
          </span>
        </label>
        <span className="ml-2 hidden tablet:inline">Theme</span>
        <ChevronDownIcon className="size-6 text-on-50/60" />
      </button>

      <div
        className={twMerge(
          "fixed right-0 z-20 mt-1 grid grid-cols-2 gap-3 border border-surface-300 bg-surface-50 p-2 shadow-lg focus:outline-none max-tablet:left-0 tablet:absolute tablet:top-full tablet:w-max tablet:rounded-lg",
          !isThemeSelectorOpen && "hidden",
        )}
      >
        {customThemes?.map((theme) => (
          <button
            suppressHydrationWarning
            key={theme.id}
            className={twMerge(
              "btn-outline tablet:btn-size-lg",
              !theme.id && "col-span-full",
              theme.id === currentTheme &&
                "pointer-events-none btn-soft/primary!",
            )}
            onClick={() => setTheme(theme.id)}
          >
            <div
              className={twMerge(
                "inline-flex w-full items-center gap-3",
                !theme.id && "justify-center",
              )}
            >
              <div
                className="size-5 rounded-full border"
                style={{
                  borderColor: get500Color(theme.accent),
                  background: `
                conic-gradient(
                  from 270deg,
                  ${get500Color(theme.primary)} 0deg 108deg,
                  ${get500Color(theme.secondary)} 108deg 152deg,
                  ${get500Color(theme.accent)} 152deg 180deg,
                  ${get500Color(theme.surface)} 180deg 360deg
                )
              `,
                }}
              />
              {theme.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function get500Color(color: ThemeColor) {
  return typeof color === "string" ? color : color[500];
}
