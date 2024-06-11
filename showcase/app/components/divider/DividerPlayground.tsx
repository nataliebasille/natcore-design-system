"use client";

import { BasicContainer } from "@/components/doc/BasicContainer";
import { Example } from "@/components/doc/Example";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

const classes = {
  variants: {
    default: false,
    primary: "divider-primary",
    secondary: "divider-secondary",
    surface: "divider-surface",
  },
} as const;

export const DividerPlayground = () => {
  const [direction, setDirection] = useState<"divider" | "divider-v">(
    "divider",
  );
  const [variant, setVariant] = useState<
    "default" | "primary" | "secondary" | "surface"
  >("default");
  const [content, setContent] = useState<string>("");

  const classesToAdd = twMerge(
    direction,
    direction === "divider-v" ? "min-h-[75px]" : false,
    classes.variants[variant],
  );
  const htmlToRender = <div className={classesToAdd}>{content}</div>;

  return (
    <BasicContainer>
      <div className="px-3">
        <Example html={htmlToRender} />
      </div>
      <div className="divider" />
      <div className="mb-3 flex items-center justify-center gap-2">
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

        <div className="form-control">
          <label>Content</label>
          <input
            type="text"
            className="w-[150px]"
            placeholder="Empty"
            maxLength={100}
            onChange={(e) => setContent(e.currentTarget.value)}
          />
        </div>

        <div>
          <div className="radio-group radio-group-secondary">
            <input
              type="radio"
              name="direction"
              id="radio-1"
              value="divider"
              checked={direction === "divider"}
              onChange={(e) =>
                setDirection(e.currentTarget.value as typeof direction)
              }
            />
            <label htmlFor="radio-1">Horizontal</label>
            <input
              type="radio"
              name="direction"
              id="radio-2"
              value="divider-v"
              checked={direction === "divider-v"}
              onChange={(e) =>
                setDirection(e.currentTarget.value as typeof direction)
              }
            />
            <label htmlFor="radio-2">Vertical</label>
          </div>
        </div>
      </div>
    </BasicContainer>
  );
};
