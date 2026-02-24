export type MatchValueAst = {
  $ast: "match-value";
  candidates: TwValueCandidate[];
};

export type MatchModifierAst = {
  $ast: "match-modifier";
  candidates: TwValueCandidate[];
};

export type TwVariableCandidate = { type: "var"; root: `--${string}` };
export type TwArbitraryCandidate = never;

export type TwValueCandidate =
  | { type: "var"; var: `--${string}` }
  | {
      type: "arbitrary";
      hint?: "*" | "length" | "color" | "number" | "ident" | "percentage";
    }
  | { type: "primitive"; kind: "integer" | "number" | "ident" };

export const match = {
  // CSS Variable
  variable: (varName: `--${string}`): MatchValueAst => ({
    $ast: "match-value",
    candidates: [{ type: "var", var: varName }],
  }),

  // Arbitrary values
  arbitraryAny: (): MatchValueAst => ({
    $ast: "match-value",
    candidates: [{ type: "arbitrary", hint: "*" }],
  }),
  arbitraryLength: (): MatchValueAst => ({
    $ast: "match-value",
    candidates: [{ type: "arbitrary", hint: "length" }],
  }),
  arbitraryColor: (): MatchValueAst => ({
    $ast: "match-value",
    candidates: [{ type: "arbitrary", hint: "color" }],
  }),
  arbitraryNumber: (): MatchValueAst => ({
    $ast: "match-value",
    candidates: [{ type: "arbitrary", hint: "number" }],
  }),
  arbitraryIdent: (): MatchValueAst => ({
    $ast: "match-value",
    candidates: [{ type: "arbitrary", hint: "ident" }],
  }),
  arbitraryPercentage: (): MatchValueAst => ({
    $ast: "match-value",
    candidates: [{ type: "arbitrary", hint: "percentage" }],
  }),

  // Primitives
  integer: (): MatchValueAst => ({
    $ast: "match-value",
    candidates: [{ type: "primitive", kind: "integer" }],
  }),
  number: (): MatchValueAst => ({
    $ast: "match-value",
    candidates: [{ type: "primitive", kind: "number" }],
  }),
  ident: (): MatchValueAst => ({
    $ast: "match-value",
    candidates: [{ type: "primitive", kind: "ident" }],
  }),

  // Union of multiple resolved values
  oneOf: (...values: MatchValueAst[]): MatchValueAst => ({
    $ast: "match-value",
    candidates: values.flatMap((v) => v.candidates),
  }),

  asModifier(value: MatchValueAst): MatchModifierAst {
    return {
      $ast: "match-modifier",
      candidates: value.candidates,
    };
  },
};
