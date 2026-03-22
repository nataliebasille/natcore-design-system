"use client";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon, SystemIcon } from "./icons";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { twMerge } from "tailwind-merge";

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <>
      {/* <DesktopThemeToggle className="max-tablet:hidden" /> */}
      <MobileThemeToggle
        className={className}
        // className="tablet:hidden"
      />
    </>
  );
}

function DesktopThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div
      className={`${twMerge("btn-group-ghost/surface btn-size-sm", className)}`}
      role="radiogroup"
      aria-label="Theme toggle"
    >
      <label suppressHydrationWarning className="flex items-center gap-2">
        <input
          type="radio"
          name="theme-toggle"
          checked={theme === "system"}
          onChange={() => setTheme("system")}
        />
        <SystemIcon className="h-[1.5em] w-[1.5em]" /> System
      </label>

      <label suppressHydrationWarning className="flex items-center gap-2">
        <input
          type="radio"
          name="theme-toggle"
          checked={theme === "light"}
          onChange={() => setTheme("light")}
        />
        <SunIcon className="h-[1.5em] w-[1.5em]" /> Light
      </label>

      <label suppressHydrationWarning className="flex items-center gap-2">
        <input
          type="radio"
          name="theme-toggle"
          checked={theme === "dark"}
          onChange={() => setTheme("dark")}
        />
        <MoonIcon className="h-[1.5em] w-[1.5em]" /> Dark
      </label>
    </div>
  );
}

function MobileThemeToggle({ className }: { className?: string }) {
  const [isMounted, setIsMounted] = useState(false);

  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const title =
    resolvedTheme === "light" ?
      "Light theme (click for dark)"
    : "Dark theme (click for light)";

  const cycleTheme = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  return (
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
      <span className="toggle-thumb flex items-center justify-center">
        {isDark ?
          <MoonIcon suppressHydrationWarning className="h-3 w-3" />
        : <SunIcon suppressHydrationWarning className="h-3 w-3" />}
      </span>
    </label>
  );
}
