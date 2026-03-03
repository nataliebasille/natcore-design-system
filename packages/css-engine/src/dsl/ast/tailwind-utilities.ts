/**
 * Tailwind CSS utility class types with CssValue support
 */

import type { AstNode } from "../visitor/visitor-builder.types";
import type { CssDataType, CssValue, CssVarAst } from "./cssvalue/public";
import type { ColorAst } from "./cssvalue/color";
import type { FunctionAst } from "./tailwind-functions/public";

/**
 * CSS value types for colors (bg-, text-, border-, etc.)
 */
export type ColorValue = CssValue<"color">;

/**
 * CSS value types for lengths/sizes (w-, h-, p-, m-, etc.)
 */
export type LengthValue = CssValue<"length">;

/**
 * Arbitrary value with CSS value support and type constraints per prefix.
 * Can be either a string literal like "[100px]" or a structured type with a constrained CssValue.
 *
 * @template D - The CSS data type (color, length, etc.)
 * @template P - The utility prefix (e.g., 'w', 'bg', 'text')
 */
export type ArbitraryValue<D extends CssDataType, P extends string> =
  | `[${string}]`
  | { prefix: P; value: CssValue<D> };

// Tailwind spacing scale
type TailwindSpacing =
  | "0"
  | "0.5"
  | "1"
  | "1.5"
  | "2"
  | "2.5"
  | "3"
  | "3.5"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "14"
  | "16"
  | "20"
  | "24"
  | "28"
  | "32"
  | "36"
  | "40"
  | "44"
  | "48"
  | "52"
  | "56"
  | "60"
  | "64"
  | "72"
  | "80"
  | "96"
  | "px"
  | "auto";
type TailwindFractional =
  | "1/2"
  | "1/3"
  | "2/3"
  | "1/4"
  | "2/4"
  | "3/4"
  | "1/5"
  | "2/5"
  | "3/5"
  | "4/5"
  | "1/6"
  | "2/6"
  | "3/6"
  | "4/6"
  | "5/6"
  | "1/12"
  | "2/12"
  | "3/12"
  | "4/12"
  | "5/12"
  | "6/12"
  | "7/12"
  | "8/12"
  | "9/12"
  | "10/12"
  | "11/12"
  | "full";
type TailwindNumericScale =
  | "50"
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900"
  | "950";
type TailwindColors =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose"
  | "inherit"
  | "current"
  | "transparent"
  | "black"
  | "white";

// Layout utilities
type LayoutDisplay =
  | "block"
  | "inline-block"
  | "inline"
  | "flex"
  | "inline-flex"
  | "table"
  | "inline-table"
  | "table-caption"
  | "table-cell"
  | "table-column"
  | "table-column-group"
  | "table-footer-group"
  | "table-header-group"
  | "table-row-group"
  | "table-row"
  | "flow-root"
  | "grid"
  | "inline-grid"
  | "contents"
  | "list-item"
  | "hidden";
type LayoutPosition = "static" | "fixed" | "absolute" | "relative" | "sticky";
type LayoutVisibility = "visible" | "invisible" | "collapse";
type LayoutOverflow =
  | "overflow-auto"
  | "overflow-hidden"
  | "overflow-clip"
  | "overflow-visible"
  | "overflow-scroll"
  | "overflow-x-auto"
  | "overflow-y-auto"
  | "overflow-x-hidden"
  | "overflow-y-hidden"
  | "overflow-x-clip"
  | "overflow-y-clip"
  | "overflow-x-visible"
  | "overflow-y-visible"
  | "overflow-x-scroll"
  | "overflow-y-scroll";
type LayoutZIndex = `${"z" | "-z"}-${0 | 10 | 20 | 30 | 40 | 50 | "auto"}`;

// Flexbox & Grid
type FlexDirection =
  | "flex-row"
  | "flex-row-reverse"
  | "flex-col"
  | "flex-col-reverse";
type FlexWrap = "flex-wrap" | "flex-wrap-reverse" | "flex-nowrap";
type FlexGrow =
  | "flex-1"
  | "flex-auto"
  | "flex-initial"
  | "flex-none"
  | "grow"
  | "grow-0";
type FlexShrink = "shrink" | "shrink-0";
type JustifyContent =
  | "justify-normal"
  | "justify-start"
  | "justify-end"
  | "justify-center"
  | "justify-between"
  | "justify-around"
  | "justify-evenly"
  | "justify-stretch";
type JustifyItems =
  | "justify-items-start"
  | "justify-items-end"
  | "justify-items-center"
  | "justify-items-stretch";
type AlignItems =
  | "items-start"
  | "items-end"
  | "items-center"
  | "items-baseline"
  | "items-stretch";
type AlignContent =
  | "content-normal"
  | "content-center"
  | "content-start"
  | "content-end"
  | "content-between"
  | "content-around"
  | "content-evenly"
  | "content-baseline"
  | "content-stretch";
type AlignSelf =
  | "self-auto"
  | "self-start"
  | "self-end"
  | "self-center"
  | "self-stretch"
  | "self-baseline";
type Gap =
  | `gap-${TailwindSpacing}`
  | `gap-x-${TailwindSpacing}`
  | `gap-y-${TailwindSpacing}`;
type GridTemplate =
  | `grid-cols-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "none" | "subgrid"}`
  | `grid-rows-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | "none" | "subgrid"}`;
type GridColumn =
  `col-${"auto" | "span-1" | "span-2" | "span-3" | "span-4" | "span-5" | "span-6" | "span-7" | "span-8" | "span-9" | "span-10" | "span-11" | "span-12" | "span-full" | "start-1" | "start-2" | "start-3" | "start-4" | "start-5" | "start-6" | "start-7" | "start-8" | "start-9" | "start-10" | "start-11" | "start-12" | "start-13" | "end-1" | "end-2" | "end-3" | "end-4" | "end-5" | "end-6" | "end-7" | "end-8" | "end-9" | "end-10" | "end-11" | "end-12" | "end-13"}`;
type GridRow =
  `row-${"auto" | "span-1" | "span-2" | "span-3" | "span-4" | "span-5" | "span-6" | "span-7" | "span-8" | "span-9" | "span-10" | "span-11" | "span-12" | "span-full" | "start-1" | "start-2" | "start-3" | "start-4" | "start-5" | "start-6" | "start-7" | "start-8" | "start-9" | "start-10" | "start-11" | "start-12" | "start-13" | "end-1" | "end-2" | "end-3" | "end-4" | "end-5" | "end-6" | "end-7" | "end-8" | "end-9" | "end-10" | "end-11" | "end-12" | "end-13"}`;

// Spacing
type Margin =
  | `${"m" | "mx" | "my" | "mt" | "mr" | "mb" | "ml" | "ms" | "me"}-${TailwindSpacing | "auto"}`
  | `${"m" | "mx" | "my" | "mt" | "mr" | "mb" | "ml" | "ms" | "me"}-[${string}]`
  | ArbitraryValue<
      "length",
      "m" | "mx" | "my" | "mt" | "mr" | "mb" | "ml" | "ms" | "me"
    >;
type Padding =
  | `${"p" | "px" | "py" | "pt" | "pr" | "pb" | "pl" | "ps" | "pe"}-${TailwindSpacing}`
  | `${"p" | "px" | "py" | "pt" | "pr" | "pb" | "pl" | "ps" | "pe"}-[${string}]`
  | ArbitraryValue<
      "length",
      "p" | "px" | "py" | "pt" | "pr" | "pb" | "pl" | "ps" | "pe"
    >;
type Space = `space-${"x" | "y"}-${TailwindSpacing | "reverse"}`;

// Sizing
type Width =
  | `w-${TailwindSpacing | TailwindFractional | "screen" | "svw" | "lvw" | "dvw" | "min" | "max" | "fit"}`
  | `w-[${string}]`
  | ArbitraryValue<"length", "w">
  | `min-w-${TailwindSpacing | TailwindFractional | "full" | "min" | "max" | "fit"}`
  | `min-w-[${string}]`
  | ArbitraryValue<"length", "min-w">
  | `max-w-${"0" | "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full" | "min" | "max" | "fit" | "prose" | "screen-sm" | "screen-md" | "screen-lg" | "screen-xl" | "screen-2xl"}`
  | `max-w-[${string}]`
  | ArbitraryValue<"length", "max-w">;
type Height =
  | `h-${TailwindSpacing | TailwindFractional | "screen" | "svh" | "lvh" | "dvh" | "min" | "max" | "fit"}`
  | `h-[${string}]`
  | ArbitraryValue<"length", "h">
  | `min-h-${TailwindSpacing | TailwindFractional | "full" | "screen" | "svh" | "lvh" | "dvh" | "min" | "max" | "fit"}`
  | `min-h-[${string}]`
  | ArbitraryValue<"length", "min-h">
  | `max-h-${TailwindSpacing | TailwindFractional | "full" | "screen" | "svh" | "lvh" | "dvh" | "min" | "max" | "fit"}`
  | `max-h-[${string}]`
  | ArbitraryValue<"length", "max-h">;
type Size =
  | `size-${TailwindSpacing | TailwindFractional | "full" | "min" | "max" | "fit"}`
  | `size-[${string}]`
  | ArbitraryValue<"length", "size">;
type AspectRatio = "aspect-auto" | "aspect-square" | "aspect-video" | `aspect-[${string}]`;

// Typography
type FontFamily = "font-sans" | "font-serif" | "font-mono";
type FontSize =
  | "text-xs"
  | "text-sm"
  | "text-base"
  | "text-lg"
  | "text-xl"
  | "text-2xl"
  | "text-3xl"
  | "text-4xl"
  | "text-5xl"
  | "text-6xl"
  | "text-7xl"
  | "text-8xl"
  | "text-9xl";
type FontWeight =
  | "font-thin"
  | "font-extralight"
  | "font-light"
  | "font-normal"
  | "font-medium"
  | "font-semibold"
  | "font-bold"
  | "font-extrabold"
  | "font-black";
type FontStyle = "italic" | "not-italic";
type TextAlign =
  | "text-left"
  | "text-center"
  | "text-right"
  | "text-justify"
  | "text-start"
  | "text-end";
type TextColor =
  | `text-${TailwindColors}`
  | `text-${Exclude<TailwindColors, "inherit" | "current" | "transparent" | "black" | "white">}-${TailwindNumericScale}`
  | `text-[${string}]`
  | ArbitraryValue<"color", "text">;
type TextDecoration =
  | "underline"
  | "overline"
  | "line-through"
  | "no-underline";
type TextTransform = "uppercase" | "lowercase" | "capitalize" | "normal-case";
type TextOverflow = "truncate" | "text-ellipsis" | "text-clip";
type LineHeight =
  | "leading-3"
  | "leading-4"
  | "leading-5"
  | "leading-6"
  | "leading-7"
  | "leading-8"
  | "leading-9"
  | "leading-10"
  | "leading-none"
  | "leading-tight"
  | "leading-snug"
  | "leading-normal"
  | "leading-relaxed"
  | "leading-loose";
type LetterSpacing =
  | "tracking-tighter"
  | "tracking-tight"
  | "tracking-normal"
  | "tracking-wide"
  | "tracking-wider"
  | "tracking-widest";
type WhiteSpace =
  | "whitespace-normal"
  | "whitespace-nowrap"
  | "whitespace-pre"
  | "whitespace-pre-line"
  | "whitespace-pre-wrap"
  | "whitespace-break-spaces";
type WordBreak = "break-normal" | "break-words" | "break-all" | "break-keep";

// Background
type BackgroundColor =
  | `bg-${TailwindColors}`
  | `bg-${Exclude<TailwindColors, "inherit" | "current" | "transparent" | "black" | "white">}-${TailwindNumericScale}`
  | `bg-[${string}]`
  | ArbitraryValue<"color", "bg">;
type BackgroundSize = "bg-auto" | "bg-cover" | "bg-contain";
type BackgroundPosition =
  | "bg-bottom"
  | "bg-center"
  | "bg-left"
  | "bg-left-bottom"
  | "bg-left-top"
  | "bg-right"
  | "bg-right-bottom"
  | "bg-right-top"
  | "bg-top";
type BackgroundRepeat =
  | "bg-repeat"
  | "bg-no-repeat"
  | "bg-repeat-x"
  | "bg-repeat-y"
  | "bg-repeat-round"
  | "bg-repeat-space";

// Border
type BorderRadius =
  `rounded${"" | "-t" | "-r" | "-b" | "-l" | "-tl" | "-tr" | "-br" | "-bl" | "-s" | "-e" | "-ss" | "-se" | "-es" | "-ee"}${"" | "-none" | "-sm" | "-md" | "-lg" | "-xl" | "-2xl" | "-3xl" | "-full"}`;
type BorderWidth =
  | `border${"" | "-t" | "-r" | "-b" | "-l" | "-x" | "-y" | "-s" | "-e"}${"" | "-0" | "-2" | "-4" | "-8"}`
  | `border${"" | "-t" | "-r" | "-b" | "-l" | "-x" | "-y" | "-s" | "-e"}-[${string}]`
  | ArbitraryValue<
      "length",
      | "border"
      | "border-t"
      | "border-r"
      | "border-b"
      | "border-l"
      | "border-x"
      | "border-y"
      | "border-s"
      | "border-e"
    >;
type BorderColor =
  | `border-${TailwindColors}`
  | `border-${Exclude<TailwindColors, "inherit" | "current" | "transparent" | "black" | "white">}-${TailwindNumericScale}`
  | `border-[${string}]`
  | ArbitraryValue<"color", "border">;
type BorderStyle =
  | "border-solid"
  | "border-dashed"
  | "border-dotted"
  | "border-double"
  | "border-hidden"
  | "border-none";
type DivideWidth =
  | `divide-${"x" | "y"}${"" | "-0" | "-2" | "-4" | "-8" | "-reverse"}`
  | `divide-${"x" | "y"}-[${string}]`
  | ArbitraryValue<"length", "divide-x" | "divide-y">;
type DivideColor =
  | `divide-${TailwindColors}`
  | `divide-${Exclude<TailwindColors, "inherit" | "current" | "transparent" | "black" | "white">}-${TailwindNumericScale}`;
type OutlineWidth =
  | "outline"
  | "outline-0"
  | "outline-1"
  | "outline-2"
  | "outline-4"
  | "outline-8";
type OutlineColor =
  | `outline-${TailwindColors}`
  | `outline-${Exclude<TailwindColors, "inherit" | "current" | "transparent" | "black" | "white">}-${TailwindNumericScale}`;
type RingWidth =
  | "ring"
  | "ring-0"
  | "ring-1"
  | "ring-2"
  | "ring-4"
  | "ring-8"
  | "ring-inset";
type RingColor =
  | `ring-${TailwindColors}`
  | `ring-${Exclude<TailwindColors, "inherit" | "current" | "transparent" | "black" | "white">}-${TailwindNumericScale}`;

// Effects
type BoxShadow =
  | "shadow-sm"
  | "shadow"
  | "shadow-md"
  | "shadow-lg"
  | "shadow-xl"
  | "shadow-2xl"
  | "shadow-inner"
  | "shadow-none";
type Opacity =
  `opacity-${0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60 | 65 | 70 | 75 | 80 | 85 | 90 | 95 | 100}`;
type MixBlendMode =
  | "mix-blend-normal"
  | "mix-blend-multiply"
  | "mix-blend-screen"
  | "mix-blend-overlay"
  | "mix-blend-darken"
  | "mix-blend-lighten"
  | "mix-blend-color-dodge"
  | "mix-blend-color-burn"
  | "mix-blend-hard-light"
  | "mix-blend-soft-light"
  | "mix-blend-difference"
  | "mix-blend-exclusion"
  | "mix-blend-hue"
  | "mix-blend-saturation"
  | "mix-blend-color"
  | "mix-blend-luminosity"
  | "mix-blend-plus-darker"
  | "mix-blend-plus-lighter";

// Filters
type Blur =
  | "blur-none"
  | "blur-sm"
  | "blur"
  | "blur-md"
  | "blur-lg"
  | "blur-xl"
  | "blur-2xl"
  | "blur-3xl";
type Brightness =
  `brightness-${0 | 50 | 75 | 90 | 95 | 100 | 105 | 110 | 125 | 150 | 200}`;
type Contrast = `contrast-${0 | 50 | 75 | 100 | 125 | 150 | 200}`;
type Grayscale = "grayscale-0" | "grayscale";
type Invert = "invert-0" | "invert";
type Saturate = `saturate-${0 | 50 | 100 | 150 | 200}`;
type Sepia = "sepia-0" | "sepia";
type BackdropBlur =
  | "backdrop-blur-none"
  | "backdrop-blur-sm"
  | "backdrop-blur"
  | "backdrop-blur-md"
  | "backdrop-blur-lg"
  | "backdrop-blur-xl"
  | "backdrop-blur-2xl"
  | "backdrop-blur-3xl";

// Transitions
type Transition =
  | "transition-none"
  | "transition-all"
  | "transition"
  | "transition-colors"
  | "transition-opacity"
  | "transition-shadow"
  | "transition-transform";
type Duration =
  `duration-${0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000 | (number & {})}`;
type Ease = "ease-linear" | "ease-in" | "ease-out" | "ease-in-out";
type Delay = `delay-${0 | 75 | 100 | 150 | 200 | 300 | 500 | 700 | 1000}`;

// Transforms
type Scale =
  | `scale-${0 | 50 | 75 | 90 | 95 | 100 | 105 | 110 | 125 | 150}`
  | `scale-${"x" | "y"}-${0 | 50 | 75 | 90 | 95 | 100 | 105 | 110 | 125 | 150}`;
type Rotate =
  `${"rotate" | "-rotate"}-${0 | 1 | 2 | 3 | 6 | 12 | 45 | 90 | 180}`;
type Translate =
  `${"translate-x" | "translate-y" | "-translate-x" | "-translate-y"}-${TailwindSpacing | TailwindFractional}`;
type Skew =
  `${"skew-x" | "skew-y" | "-skew-x" | "-skew-y"}-${0 | 1 | 2 | 3 | 6 | 12}`;

// Interactivity
type Cursor =
  | "cursor-auto"
  | "cursor-default"
  | "cursor-pointer"
  | "cursor-wait"
  | "cursor-text"
  | "cursor-move"
  | "cursor-help"
  | "cursor-not-allowed"
  | "cursor-none"
  | "cursor-context-menu"
  | "cursor-progress"
  | "cursor-cell"
  | "cursor-crosshair"
  | "cursor-vertical-text"
  | "cursor-alias"
  | "cursor-copy"
  | "cursor-no-drop"
  | "cursor-grab"
  | "cursor-grabbing"
  | "cursor-all-scroll"
  | "cursor-col-resize"
  | "cursor-row-resize"
  | "cursor-n-resize"
  | "cursor-e-resize"
  | "cursor-s-resize"
  | "cursor-w-resize"
  | "cursor-ne-resize"
  | "cursor-nw-resize"
  | "cursor-se-resize"
  | "cursor-sw-resize"
  | "cursor-ew-resize"
  | "cursor-ns-resize"
  | "cursor-nesw-resize"
  | "cursor-nwse-resize"
  | "cursor-zoom-in"
  | "cursor-zoom-out";
type PointerEvents = "pointer-events-none" | "pointer-events-auto";
type Resize = "resize-none" | "resize-y" | "resize-x" | "resize";
type UserSelect = "select-none" | "select-text" | "select-all" | "select-auto";

// Container & Misc
type Container = "container";
type BoxSizing = "box-border" | "box-content";
type Float =
  | "float-start"
  | "float-end"
  | "float-right"
  | "float-left"
  | "float-none";
type Clear =
  | "clear-start"
  | "clear-end"
  | "clear-left"
  | "clear-right"
  | "clear-both"
  | "clear-none";
type ObjectFit =
  | "object-contain"
  | "object-cover"
  | "object-fill"
  | "object-none"
  | "object-scale-down";
type ObjectPosition =
  | "object-bottom"
  | "object-center"
  | "object-left"
  | "object-left-bottom"
  | "object-left-top"
  | "object-right"
  | "object-right-bottom"
  | "object-right-top"
  | "object-top";

// Combined Tailwind utility type
export type TailwindUtility =
  | LayoutDisplay
  | LayoutPosition
  | LayoutVisibility
  | LayoutOverflow
  | LayoutZIndex
  | FlexDirection
  | FlexWrap
  | FlexGrow
  | FlexShrink
  | JustifyContent
  | JustifyItems
  | AlignItems
  | AlignContent
  | AlignSelf
  | Gap
  | GridTemplate
  | GridColumn
  | GridRow
  | Margin
  | Padding
  | Space
  | Width
  | Height
  | Size
  | AspectRatio
  | FontFamily
  | FontSize
  | FontWeight
  | FontStyle
  | TextAlign
  | TextColor
  | TextDecoration
  | TextTransform
  | TextOverflow
  | LineHeight
  | LetterSpacing
  | WhiteSpace
  | WordBreak
  | BackgroundColor
  | BackgroundSize
  | BackgroundPosition
  | BackgroundRepeat
  | BorderRadius
  | BorderWidth
  | BorderColor
  | BorderStyle
  | DivideWidth
  | DivideColor
  | OutlineWidth
  | OutlineColor
  | RingWidth
  | RingColor
  | BoxShadow
  | Opacity
  | MixBlendMode
  | Blur
  | Brightness
  | Contrast
  | Grayscale
  | Invert
  | Saturate
  | Sepia
  | BackdropBlur
  | Transition
  | Duration
  | Ease
  | Delay
  | Scale
  | Rotate
  | Translate
  | Skew
  | Cursor
  | PointerEvents
  | Resize
  | UserSelect
  | Container
  | BoxSizing
  | Float
  | Clear
  | ObjectFit
  | ObjectPosition;

export type TailwindClassAst = AstNode<
  "tailwind-class",
  {
    value: TailwindUtility;
  }
>;

export function tw(value: TailwindUtility): TailwindClassAst {
  return {
    $ast: "tailwind-class",
    value,
  };
}

/**
 * Maps each Tailwind prefix to its CSS data type.
 * This ensures type safety when creating arbitrary values.
 */
export type PrefixDataTypeMap = {
  // Color utilities
  bg: "color";
  text: "color";
  border: "color";

  // Sizing utilities
  w: "length";
  h: "length";
  "min-w": "length";
  "max-w": "length";
  "min-h": "length";
  "max-h": "length";
  size: "length";

  // Margin utilities
  m: "length";
  mx: "length";
  my: "length";
  mt: "length";
  mr: "length";
  mb: "length";
  ml: "length";
  ms: "length";
  me: "length";

  // Padding utilities
  p: "length";
  px: "length";
  py: "length";
  pt: "length";
  pr: "length";
  pb: "length";
  pl: "length";
  ps: "length";
  pe: "length";

  // Border width utilities
  "border-t": "length";
  "border-r": "length";
  "border-b": "length";
  "border-l": "length";
  "border-x": "length";
  "border-y": "length";
  "border-s": "length";
  "border-e": "length";

  // Divide utilities
  "divide-x": "length";
  "divide-y": "length";
};

/**
 * Helper function to create arbitrary value utilities with strongly-typed prefix-value pairs.
 * Only allows valid combinations of prefixes and value types.
 *
 * @example
 * // Valid: Length values for sizing/spacing
 * arbitraryValue('w', '100px')
 * arbitraryValue('m', cssv`calc(100% - 1rem)`)
 *
 * // Valid: Color values for colors
 * arbitraryValue('bg', color('primary', 500))
 * arbitraryValue('text', '#ff0000')
 *
 * // Invalid: Type error - can't use color for width
 * arbitraryValue('w', color('red', 500)) // ❌ Type error
 *
 * // Invalid: Type error - can't use length for background
 * arbitraryValue('bg', '100px') // ❌ Type error
 */
export function arbitraryValue<P extends keyof PrefixDataTypeMap>(
  prefix: P,
  value: CssValue<PrefixDataTypeMap[P]>,
): ArbitraryValue<PrefixDataTypeMap[P], P> {
  return { prefix, value };
}

const x = arbitraryValue("border-b", "2px");
