import { describe, expect, test } from "vitest";
import { parse } from "./parser";

describe("css parser", () => {
  test("parses @property at-rule descriptors", () => {
    const ast = parse(`
      @property --brand-color {
        syntax: "<color>";
        inherits: false;
        initial-value: #663399;
      }
    `);

    expect(ast).toEqual({
      $css: "at-rule",
      name: "property",
      prelude: "--brand-color",
      body: [
        {
          $css: "style-list",
          styles: [
            {
              syntax: '"<color>"',
              inherits: "false",
              "initial-value": "#663399",
            },
          ],
        },
      ],
    });
  });
});
