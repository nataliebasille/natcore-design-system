"use client";

import React, { cloneElement } from "react";
import { usePlayground } from "./playground-provider";

type NativeInputElement = React.ReactElement<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
>;

type CustomInputProps<V> = {
  value: V;
  onChange: (value: V) => void;
};

export type PlaygroundFormElementProps<T extends Record<string, unknown>> = {
  [K in keyof T & string]: {
    name: K;
    label?: string;
    input: NativeInputElement | React.FC<CustomInputProps<T[K]>>;
  };
}[keyof T & string];

export function PlaygroundFormElement<T extends Record<string, unknown>>(
  props: PlaygroundFormElementProps<T>,
) {
  const { values, setValue } = usePlayground<T>();
  const { name, label, input: Input } = props;
  const value = values[name];
  const onChange = React.useCallback(
    (
      value:
        | T[typeof name]
        | React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
          >,
    ) => {
      const nextValue =
        isFormEvent(value) ? (value.target.value as T[typeof name]) : value;
      setValue(name, nextValue);
    },
    [name, setValue],
  );

  const CustomInput = Input as React.FC<CustomInputProps<T[typeof name]>>;

  return (
    <div className="form-control">
      <label htmlFor={name}>{label ?? name}</label>
      {typeof Input === "function" ?
        <CustomInput value={value} onChange={onChange} />
      : cloneElement(Input, {
          name,
          value,
          onChange,
        } as any)
      }
    </div>
  );
}

function isFormEvent(
  candidate: unknown,
): candidate is React.ChangeEvent<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
> {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    "target" in candidate &&
    typeof candidate.target === "object" &&
    candidate.target !== null &&
    "value" in candidate.target
  );
}
