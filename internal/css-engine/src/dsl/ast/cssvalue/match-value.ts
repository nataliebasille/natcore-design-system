import type { Eager } from "../../../utils/index.ts";
import type {
  CssDataType,
  SupportedArbitraryDataType,
  SupportedBareDataType,
} from "./css-primitive.ts";
import type { VarLiteral } from "./cssvar.ts";

type TwCandiate<Name, Args extends Record<string, unknown>> =
  Args extends any ? Eager<{ $twCandidate: Name } & Args> : never;

export type TwVariableCandidate = TwCandiate<"variable", { root: VarLiteral }>;

type TwArbitraryCandidateMap = {
  [T in SupportedArbitraryDataType | "*"]: TwCandiate<
    "arbitrary",
    { dataType: T }
  >;
};

type TwBareCandidateMap = {
  [T in SupportedBareDataType]: TwCandiate<"bare", { dataType: T }>;
};

export type TwArbitraryCandidate = TwArbitraryCandidateMap[
  | SupportedArbitraryDataType
  | "*"];

export type TwBareCandidate = TwBareCandidateMap[SupportedBareDataType];

export type TwValueCandidate<D extends CssDataType> =
  | TwVariableCandidate
  | Extract<TwArbitraryCandidate, { dataType: "*" }>
  | (D extends CssDataType ? Extract<TwArbitraryCandidate, { dataType: D }>
    : never)
  | (D extends CssDataType ? Extract<TwBareCandidate, { dataType: D }> : never);

export type MatchValueAst<D extends CssDataType> = {
  $ast: "match-value";
  candidates: TwValueCandidate<D>[];
};

export type MatchModifierAst<D extends CssDataType> = {
  $ast: "match-modifier";
  candidates: TwValueCandidate<D>[];
};

export const match = {
  // CSS Variable
  variable: (varName: `--${string}`): MatchValueAst<CssDataType> => ({
    $ast: "match-value",
    candidates: [{ $twCandidate: "variable", root: varName }],
  }),

  // Arbitrary values
  arbitrary: {
    any: (): MatchValueAst<CssDataType> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "*" }],
    }),
    absoluteSize: (): MatchValueAst<"absolute-size"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "absolute-size" }],
    }),
    angle: (): MatchValueAst<"angle"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "angle" }],
    }),
    bgSize: (): MatchValueAst<"bg-size"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "bg-size" }],
    }),
    color: (): MatchValueAst<"color"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "color" }],
    }),
    familyName: (): MatchValueAst<"family-name"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "family-name" }],
    }),
    genericName: (): MatchValueAst<"generic-name"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "generic-name" }],
    }),
    image: (): MatchValueAst<"image"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "image" }],
    }),
    length: (): MatchValueAst<"length"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "length" }],
    }),
    lineWidth: (): MatchValueAst<"line-width"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "line-width" }],
    }),
    number: (): MatchValueAst<"number"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "number" }],
    }),
    percentage: (): MatchValueAst<"percentage"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "percentage" }],
    }),
    position: (): MatchValueAst<"position"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "position" }],
    }),
    ratio: (): MatchValueAst<"ratio"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "ratio" }],
    }),
    relativeSize: (): MatchValueAst<"relative-size"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "relative-size" }],
    }),
    url: (): MatchValueAst<"url"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "url" }],
    }),
    vector: (): MatchValueAst<"vector"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "arbitrary", dataType: "vector" }],
    }),
  },

  // Legacy arbitrary aliases (for backward compatibility)
  arbitraryAny: (): MatchValueAst<CssDataType> => ({
    $ast: "match-value",
    candidates: [{ $twCandidate: "arbitrary", dataType: "*" }],
  }),
  arbitraryLength: (): MatchValueAst<"length"> => ({
    $ast: "match-value",
    candidates: [{ $twCandidate: "arbitrary", dataType: "length" }],
  }),
  arbitraryColor: (): MatchValueAst<"color"> => ({
    $ast: "match-value",
    candidates: [{ $twCandidate: "arbitrary", dataType: "color" }],
  }),
  arbitraryNumber: (): MatchValueAst<"number"> => ({
    $ast: "match-value",
    candidates: [{ $twCandidate: "arbitrary", dataType: "number" }],
  }),
  arbitraryPercentage: (): MatchValueAst<"percentage"> => ({
    $ast: "match-value",
    candidates: [{ $twCandidate: "arbitrary", dataType: "percentage" }],
  }),

  // Bare/Primitive values
  bare: {
    integer: (): MatchValueAst<"integer"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "bare", dataType: "integer" }],
    }),
    number: (): MatchValueAst<"number"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "bare", dataType: "number" }],
    }),
    percentage: (): MatchValueAst<"percentage"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "bare", dataType: "percentage" }],
    }),
    ratio: (): MatchValueAst<"ratio"> => ({
      $ast: "match-value",
      candidates: [{ $twCandidate: "bare", dataType: "ratio" }],
    }),
  },

  // Union of multiple resolved values
  oneOf: <D extends CssDataType>(
    ...values: MatchValueAst<D>[]
  ): MatchValueAst<D> => ({
    $ast: "match-value",
    candidates: values.flatMap((v) => v.candidates),
  }),

  asModifier: <D extends CssDataType>(
    value: MatchValueAst<D>,
  ): MatchModifierAst<D> => {
    return {
      $ast: "match-modifier",
      candidates: value.candidates,
    };
  },
};
