type ColorValueBg =
  | "50"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";
type ColorValue = ColorValueBg | `${ColorValueBg}-text`;

export type ColorAst<
  V extends ColorValue = ColorValue,
  O extends number | undefined = undefined,
> =
  O extends undefined ?
    {
      type: "color";
      value: V;
    }
  : {
      type: "color";
      value: V;
      opacity: O;
    };

export function color<V extends ColorValue>(value: V): ColorAst<V, undefined>;
export function color<V extends ColorValue, O extends number>(
  value: V,
  opacity: O,
): ColorAst<V, O>;
export function color<
  const V extends ColorValue,
  const O extends number | undefined,
>(value: V, opacity?: O) {
  return {
    type: "color",
    value,
    opacity,
  } as ColorAst<V, O>;
}
