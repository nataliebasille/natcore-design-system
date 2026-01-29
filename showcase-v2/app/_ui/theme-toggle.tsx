"use client";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon, SystemIcon } from "./icons";
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

export function ThemeToggle() {
  return (
    <>
      {/* <DesktopThemeToggle className="max-md:hidden" /> */}
      <MobileThemeToggle
      // className="md:hidden"
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
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const title =
    theme === "system" ? "System theme (click for light)"
    : theme === "dark" ? "Dark theme (click for system)"
    : "Light theme (click for dark)";

  return (
    <button
      suppressHydrationWarning
      className={`${twMerge("btn-ghost/surface btn-icon btn-size-sm", className)}`}
      onClick={cycleTheme}
      title={title}
      aria-label={title}
    >
      {theme === "system" ?
        <SystemIcon suppressHydrationWarning className="h-[1.5em] w-[1.5em]" />
      : theme === "dark" ?
        <MoonIcon suppressHydrationWarning className="h-[1.5em] w-[1.5em]" />
      : <SunIcon suppressHydrationWarning className="h-[1.5em] w-[1.5em]" />}
    </button>
  );
}
