"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { PlaygroundValues } from "./playground";

export const PlaygroundContext = createContext({
  values: {} as Record<string, string>,
  setValue: (name: string, value: string) => {},
});

export function PlaygroundProvider({
  defaultValues,
  children,
}: PropsWithChildren<{
  defaultValues: Record<string, string>;
}>) {
  const [values, setValues] = useState<Record<string, string>>(defaultValues);

  const setIndividualValue = useCallback((name: string, value: string) => {
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  }, []);

  return (
    <PlaygroundContext.Provider
      value={useMemo(
        () => ({ values, setValue: setIndividualValue }),
        [values, setIndividualValue],
      )}
    >
      {children}
    </PlaygroundContext.Provider>
  );
}

export function usePlayground<
  const T extends Record<string, React.ReactElement>,
>() {
  const context = useContext(PlaygroundContext);

  if (!context) {
    throw new Error("usePlayground must be used within a PlaygroundProvider");
  }

  return context as {
    values: PlaygroundValues<T>;
    setValue: (name: keyof T, value: string) => void;
  };
}
