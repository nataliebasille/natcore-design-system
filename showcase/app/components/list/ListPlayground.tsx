"use client";

import { BasicContainer } from "@/components/doc/BasicContainer";
import { Example } from "@/components/doc/Example";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

const classes = {
  variants: {
    default: false,
    primary: "list-primary",
    secondary: "list-secondary",
    surface: "list-surface",
    accent: "list-accent",
  },
  styles: {
    interactive: false,
    disc: "list-disc",
    decimal: "list-decimal",
  },
} as const;

export const ListPlayground = () => {
  const [selectedItem, setSelectedItem] = useState<null | 0 | 1 | 2>(null);
  const [variant, setVariant] = useState<
    "default" | "primary" | "secondary" | "surface" | "accent"
  >("default");
  const [type, setType] = useState<"interactive" | "disc" | "decimal">(
    "interactive",
  );
  const handleSelectionChange = (index: typeof selectedItem) => {
    setSelectedItem(index);
  };

  const ListItem = type === "interactive" ? "div" : "li";
  const List = type === "interactive" ? "div" : type === "disc" ? "ul" : "ol";

  return (
    <BasicContainer>
      <Example
        html={
          <List
            className={twMerge(
              "list",
              classes.styles[type],
              classes.variants[variant],
            )}
          >
            <ListItem
              className={twMerge("list-item", selectedItem === 0 && "active")}
              onClick={() => handleSelectionChange(0)}
            >
              Item 1
            </ListItem>
            <ListItem
              className={twMerge("list-item", selectedItem === 1 && "active")}
              onClick={() => handleSelectionChange(1)}
            >
              Item 2
            </ListItem>
            <ListItem
              className={twMerge("list-item", selectedItem === 2 && "active")}
              onClick={() => handleSelectionChange(2)}
            >
              Item 3
            </ListItem>
          </List>
        }
      />
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
            <option value="primary">list-primary</option>
            <option value="secondary">list-secondary</option>
            <option value="surface">list-surface</option>
            <option value="accent">list-accent</option>
          </select>
        </div>

        <div className="radio-group radio-group-surface">
          <input
            type="radio"
            name="direction"
            id="radio-1"
            value="interactive"
            checked={type === "interactive"}
            onChange={(e) => setType(e.currentTarget.value as typeof type)}
          />
          <label htmlFor="radio-1">Interactive</label>
          <input
            type="radio"
            name="direction"
            id="radio-2"
            value="disc"
            checked={type === "disc"}
            onChange={(e) => setType(e.currentTarget.value as typeof type)}
          />
          <label htmlFor="radio-2">Unordered</label>
          <input
            type="radio"
            name="direction"
            id="radio-3"
            value="decimal"
            checked={type === "decimal"}
            onChange={(e) => setType(e.currentTarget.value as typeof type)}
          />
          <label htmlFor="radio-3">Ordered</label>
        </div>

        {/* <div className="form-control">
          <label>Content</label>
          <input
            type="text"
            className="w-[150px]"
            placeholder="Empty"
            maxLength={100}
            onChange={(e) => setContent(e.currentTarget.value)}
          />
        </div>

        */}
      </div>
    </BasicContainer>
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="list list-primary">
        <div className="list-item">Item 1</div>
        <div className="list-item">Item 2</div>
        <div className="list-item">Item 3</div>
      </div>

      <div className="list list-secondary">
        <div className="list-item">Item 1</div>
        <div className="list-item">Item 2</div>
        <div className="list-item">Item 3</div>
      </div>

      <div className="list list-surface">
        <div className="list-item">Item 1</div>
        <div className="list-item">Item 2</div>
        <div className="list-item">Item 3</div>
      </div>

      <div className="list list-accent">
        <div className="list-item">Item 1</div>
        <div className="list-item">Item 2</div>
        <div className="list-item">Item 3</div>
      </div>
    </div>
  );
};
