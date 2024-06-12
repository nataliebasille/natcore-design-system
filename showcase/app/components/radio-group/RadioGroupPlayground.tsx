"use client";

import { BasicContainer } from "@/components/doc/BasicContainer";
import { Example } from "@/components/doc/Example";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

const classes = {
  variants: {
    default: false,
    primary: "radio-group-primary",
    secondary: "radio-group-secondary",
    surface: "radio-group-surface",
    accent: "radio-group-accent",
  },
} as const;
export const RadioGroupPlayground = () => {
  const [variant, setVariant] = useState<
    "default" | "primary" | "secondary" | "surface"
  >("default");
  return (
    <BasicContainer>
      <Example
        html={
          <div className={twMerge("radio-group", classes.variants[variant])}>
            <input
              type="radio"
              name="radio-group"
              id="radio-1"
              value="1"
              defaultChecked
            />
            <label htmlFor="radio-1">One</label>
            <input type="radio" name="radio-group" id="radio-2" value="2" />
            <label htmlFor="radio-2">Two</label>
            <input type="radio" name="radio-group" id="radio-3" value="3" />
            <label htmlFor="radio-3">Three</label>
          </div>
        }
      />
      <div className="divider" />
      <div className="mb-3 flex gap-2">
        <div className="form-control">
          <label>Variant</label>
          <select
            value={variant}
            onChange={(e) =>
              setVariant(e.currentTarget.value as typeof variant)
            }
          >
            <option value="default">default</option>
            <option value="primary">card-primary</option>
            <option value="secondary">card-secondary</option>
            <option value="surface">card-surface</option>
            <option value="accent">card-accent</option>
          </select>
        </div>
      </div>
    </BasicContainer>
  );
};
