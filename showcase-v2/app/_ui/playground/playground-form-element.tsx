"use client";

import { cloneElement } from "react";
import { usePlayground } from "./playground-provider";

type PlaygroundFormElementProps = {
  name: string;
  label?: string;
  input: React.ReactElement<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >;
};

export function PlaygroundFormElement({
  name,
  label,
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

  return (
    <div className="form-control">
      <label htmlFor={name}>{label ?? name}</label>
      {cloneElement(input, {
        id: name,
        value,
        onChange,
      } as any)}
    </div>
  );
}
