"use client";

import React, { cloneElement } from "react";
import { usePlayground } from "./playground-provider";

type PlaygroundFormElementProps = {
  name: string;
  label?: string;
  input:
    | React.ReactElement<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    | React.FC<{ value: string; onChange: (value: string) => void }>;
};

export function PlaygroundFormElement({
  name,
  label,
  input: Input,
}: PlaygroundFormElementProps) {
  const { values, setValue } = usePlayground();
  const value = values[name] || "";
  const onChange = React.useCallback(
    (
      value:
        | string
        | React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >,
    ) => {
      setValue(name, typeof value === "string" ? value : value.target.value);
    },
    [name, setValue],
  );

  return (
    <div className="form-control">
      <label htmlFor={name}>{label ?? name}</label>
      {typeof Input === "function" ?
        <Input value={value} onChange={onChange} />
      : cloneElement(Input, {
          name,
          value,
          onChange,
        } as any)
      }
    </div>
  );
}
