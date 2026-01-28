"use client";

import { useTheme } from "next-themes";
import { MoonIcon, SunIcon, SystemIcon } from "./icons";

export function ThemeToggle() {
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
      className="btn-ghost/surface btn-icon btn-size-sm"
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
