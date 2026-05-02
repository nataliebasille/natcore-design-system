"use client";

import { useTheme } from "next-themes";
import { useCallback, useLayoutEffect, useState } from "react";
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
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { resolvedTheme, setTheme: setLightDark } = useTheme();
  const isDark = resolvedTheme === "dark";
  const title =
    resolvedTheme === "light" ?
      "Light theme (click for dark)"
    : "Dark theme (click for light)";

  const cycleTheme = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      evt.stopPropagation();
      setLightDark(isDark ? "light" : "dark");
    },
    [resolvedTheme, setLightDark],
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

  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={twMerge("relative ml-auto w-max", className)}>
      <button
        className="inline-flex btn-ghost/surface transform-none items-center-safe [--btn-px:0.25rem] [--btn-py:0.25rem]"
        onClick={toggleThemeSelector}
      >
        <label
          suppressHydrationWarning
          className={twMerge(
            "toggle-outline/surface toggle-on:text-white toggle-off:palette-surface",
            className,
            !isMounted && "invisible",
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
          <span data-slot="thumb" className="flex items-center justify-center">
            {isDark ?
              <MoonIcon suppressHydrationWarning className="h-3 w-3" />
            : <SunIcon suppressHydrationWarning className="h-3 w-3" />}
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
            key={theme.id}
            className={twMerge(
              "inline-flex btn-outline items-center gap-3 tablet:btn-size-lg",
              !theme.id && "col-span-full justify-center",
            )}
            onClick={() => setTheme(theme.id)}
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
          </button>
        ))}
      </div>
    </div>
  );
}

function get500Color(color: ThemeColor) {
  return typeof color === "string" ? color : color[500];
}
