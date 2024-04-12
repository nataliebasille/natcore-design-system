import natcorePlugin from "../packages/core/src/plugin";
import { toRgb } from "../packages/core/src/utils";

export const plugin = natcorePlugin({
  primary: toRgb("#001F36"),
  secondary: toRgb("#efaa9c"),
  accent: toRgb("#e87a01"),
  surface: toRgb("#f7dcdf"),
});
