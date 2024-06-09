"use client";

import { type ReactNode } from "react";
import { ExampleClient } from "./ExampleClient";

export const Example = ({ html }: { html: string | ReactNode }) => {
  return <ExampleClient html={html} />;
};
