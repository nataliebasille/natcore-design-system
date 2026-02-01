"use client";

import { cloneElement, useEffect, useRef } from "react";
import { usePlayground } from "./playground-provider";

type PlaygroundFormElementProps = {
  name: string;
  input: React.ReactElement<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
};

export function PlaygroundFormElement({
  name,
  input,
}: PlaygroundFormElementProps) {
  const { values, setValue } = usePlayground();
  const value = values[name] || "";
  const onChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setValue(name, event.target.value);
  };

  return cloneElement(input, {
    value,
    onChange,
  } as any);
}
