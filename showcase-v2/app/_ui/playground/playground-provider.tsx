"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export const PlaygroundContext = createContext({
  values: {} as Record<string, unknown>,
  setValue: (name: string, value: unknown) => {},
});

export function PlaygroundProvider({
  defaultValues,
  children,
}: PropsWithChildren<{
  defaultValues: Record<string, unknown>;
}>) {
  const [values, setValues] = useState<Record<string, unknown>>(defaultValues);

  const setIndividualValue = useCallback((name: string, value: unknown) => {
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

export function usePlayground<const T extends Record<string, unknown>>() {
  const context = useContext(PlaygroundContext);

  if (!context) {
    throw new Error("usePlayground must be used within a PlaygroundProvider");
  }

  return context as {
    values: T;
    setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  };
}
