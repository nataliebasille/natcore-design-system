"use client"; // This component runs on the client

import {
  useEffect,
  useLayoutEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: PropsWithChildren<{}>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={["light", "dark", "system"]}
      value={{
        light: "scheme-light",
        dark: "scheme-dark",
        system: "scheme-light-dark",
      }}
    >
      {children}
    </NextThemesProvider>
  );
}
