import { describe, expect, expectTypeOf, it } from "vitest";
import {
  type AstSpecIn,
  type AstSpecOut,
  type CombinedAstSpec,
  type AstSpec_Normalize,
  type ParentsOf,
  type ApplyOutMap,
  type VisitorOutMap,
} from "./visitor-builder.types";
import type {
  AstNode,
  StyleProperties,
  ThemeAst,
  ThemeProperties,
} from "../ast/public";

describe("CombinedAstSpec", () => {
  it("should convert a single AstNode to a spec object", () => {
    type ColorNode = { $ast: "color"; value: string };
    type Expected = { color: { $in: ColorNode; $out: ColorNode } };
    type Actual = CombinedAstSpec<ColorNode>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should convert spec with multiple entries to same spec", () => {
    type Spec = {
      color: { $ast: "color"; value: string };
      size: number;
      opacity: { $in: number; $out: string };
    };

    type Expected = {
      color: {
        $in: { $ast: "color"; value: string };
        $out: { $ast: "color"; value: string };
      };
      size: { $in: number; $out: number };
      opacity: { $in: number; $out: number | string };
    };
    type Actual = CombinedAstSpec<Spec>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should combine multiple AstNodes into a single spec", () => {
    type ColorNode = { $ast: "color"; value: string };
    type SizeNode = { $ast: "size"; px: number };
    type ToneNode = { $ast: "tone"; level: number };
    type Expected = {
      color: { $in: ColorNode; $out: ColorNode };
      size: { $in: SizeNode; $out: SizeNode };
      tone: { $in: ToneNode; $out: ToneNode };
    };
    type Actual = CombinedAstSpec<ColorNode | SizeNode | ToneNode>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should combine multiple specs into a single spec", () => {
    type SpecA = {
      color: { $ast: "color"; value: string };
      size: number;
    };

    type SpecB = AstSpec_Normalize<{
      opacity: { $in: number; $out: number | string };
      tone: {
        $in: { $ast: "tone"; level: number };
        $out: { $ast: "tone"; level: number };
      };
    }>;

    type Expected = {
      color: {
        $in: { $ast: "color"; value: string };
        $out: { $ast: "color"; value: string };
      };
      size: { $in: number; $out: number };
      opacity: { $in: number; $out: number | string };
      tone: {
        $in: { $ast: "tone"; level: number };
        $out: { $ast: "tone"; level: number };
      };
    };

    type Actual = CombinedAstSpec<SpecA | SpecB>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should handle empty AstSpec", () => {
    type EmptySpec = {};
    type Expected = EmptySpec;
    type Actual = CombinedAstSpec<EmptySpec>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should preserve literal types in AstNode id", () => {
    type LiteralNode = { $ast: "my-custom-type"; data: unknown };
    type Expected = {
      "my-custom-type": { $in: LiteralNode; $out: LiteralNode };
    };
    type Actual = CombinedAstSpec<LiteralNode>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should handle union with AstNodes and AstSpec", () => {
    type ColorAst = { $ast: "color"; value: string };
    type ToneAst = { $ast: "tone"; inner: ColorAst };
    type CssVarAst = { $ast: "cssVar"; name: string };

    type AllNodes =
      | { color: { $in: ColorAst; $out: ColorAst | CssVarAst } }
      | ToneAst
      | CssVarAst
      | { styles: StyleProperties };

    type Expected = {
      color: { $in: ColorAst; $out: ColorAst | CssVarAst };
      tone: { $in: ToneAst; $out: ToneAst };
      cssVar: { $in: CssVarAst; $out: CssVarAst };
      styles: { $in: StyleProperties; $out: StyleProperties };
    };
    type Actual = CombinedAstSpec<AllNodes>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should handle ast node with custom $out", () => {
    type AstA = { $in: { $ast: "A"; value: string }; $out: number };
    type AstB = { $ast: "B"; child: AstA; count: number };
    type Spec = CombinedAstSpec<AstA | AstB>;

    type Expected = {
      A: {
        $in: AstA["$in"];
        $out: AstA["$in"] | AstA["$out"];
      };
      B: { $in: AstB; $out: AstB };
    };
    type Actual = CombinedAstSpec<Spec>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });
});

describe("AstSpecIn", () => {
  it("should return type as-is when no $in property exists", () => {
    type PlainType = AstSpec_Normalize<{ plain: number }>;
    type Expected_A = PlainType["plain"]["$in"];
    type Actual_A = AstSpecIn<PlainType["plain"]>;
    expectTypeOf<Actual_A>().toEqualTypeOf<Expected_A>();

    type TupleType = AstSpec_Normalize<{ tuple: [number, string, boolean] }>;
    type Expected_B = TupleType["tuple"]["$in"];
    type Actual_B = AstSpecIn<TupleType["tuple"]>;
    expectTypeOf<Actual_B>().toEqualTypeOf<Expected_B>();

    type ArrayType = AstSpec_Normalize<{ array: Array<Date> }>;
    type Expected_C = ArrayType["array"]["$in"];
    type Actual_C = AstSpecIn<ArrayType["array"]>;
    expectTypeOf<Actual_C>().toEqualTypeOf<Expected_C>();
  });

  it("should extract $in type when present", () => {
    type WithIn = AstSpec_Normalize<{ with: { $in: string[] } }>;
    type Expected = WithIn["with"]["$in"];
    type Actual = AstSpecIn<WithIn["with"]>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should extract $in type when both $in and $out are present", () => {
    type With_In_And_Out = {
      $in: { x: number; y: number };
      $out: { x: string; y: string };
    };
    type Expected = With_In_And_Out["$in"];
    type Actual = AstSpecIn<With_In_And_Out>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });
});

describe("AstSpecOut", () => {
  it("should return type as-is when no $in property exists", () => {
    type PlainType = AstSpec_Normalize<{ plain: number }>;
    type Expected_A = PlainType["plain"]["$out"];
    type Actual_A = AstSpecOut<PlainType["plain"]>;
    expectTypeOf<Actual_A>().toEqualTypeOf<Expected_A>();

    type TupleType = AstSpec_Normalize<{ tuple: [number, string, boolean] }>;
    type Expected_B = TupleType["tuple"]["$out"];
    type Actual_B = AstSpecOut<TupleType["tuple"]>;
    expectTypeOf<Actual_B>().toEqualTypeOf<Expected_B>();

    type ArrayType = AstSpec_Normalize<{ array: Array<Date> }>;
    type Expected_C = ArrayType["array"]["$out"];
    type Actual_C = AstSpecOut<ArrayType["array"]>;
    expectTypeOf<Actual_C>().toEqualTypeOf<Expected_C>();
  });

  it("should return $in type when only $in is present", () => {
    type WithIn = AstSpec_Normalize<{ with: { $in: string[] } }>;
    type Expected = WithIn["with"]["$out"];
    type Actual = AstSpecOut<WithIn["with"]>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should return union of $in and $out when both are present", () => {
    type With_In_And_Out = AstSpec_Normalize<{
      with: {
        $in: { x: number; y: number };
        $out: { x: string; y: string };
      };
    }>;
    type Expected =
      | With_In_And_Out["with"]["$in"]
      | With_In_And_Out["with"]["$out"];
    type Actual = AstSpecOut<With_In_And_Out["with"]>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });
});

describe("ParentOf", () => {
  it("parent of type level node should be never", () => {
    type AstA = { $ast: "A"; value: string };
    type AstB = { $ast: "B"; child: AstA; count: number };
    type AstC = { $ast: "C"; child: AstB; name: string };
    type Spec = CombinedAstSpec<AstA | AstB | AstC>;
    type Actual = ParentsOf<Spec, AstC>;
    expectTypeOf<Actual>().toBeNever();
  });

  it("should find parent type that directly contains a child property", () => {
    type AstA = { $ast: "A"; value: string };
    type AstB = { $ast: "B"; child: AstA; count: number };
    type Spec = CombinedAstSpec<AstA | AstB>;
    type Expected = AstB;
    type Actual = ParentsOf<Spec, AstA>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should find parent type that contains child in an array", () => {
    type AstA = { $ast: "A"; value: string };
    type AstB = { $ast: "B"; children: AstA[]; count: number };
    type Spec = CombinedAstSpec<AstA | AstB>;
    type Expected = AstB;
    type Actual = ParentsOf<Spec, AstA>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should find parent with readonly array", () => {
    type AstA = { $ast: "A"; value: string };
    type AstB = { $ast: "B"; children: readonly AstA[]; count: number };
    type Spec = CombinedAstSpec<AstA | AstB>;
    type Expected = AstB;
    type Actual = ParentsOf<Spec, AstA>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should find multiple parent types that contain the same child type", () => {
    type AstA = { $ast: "A"; value: string };
    type AstB = { $ast: "B"; child: AstA; count: number };
    type AstC = { $ast: "C"; child: AstA[]; name: string };
    type Spec = CombinedAstSpec<AstA | AstB | AstC>;
    type Expected = AstB | AstC;
    type Actual = ParentsOf<Spec, AstA>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should work when child type is contained in a property with a union", () => {
    type AstA = { $ast: "A"; value: string };
    type AstB = { $ast: "B"; count: number };
    type AstC = { $ast: "C"; child: AstA | AstB[]; name: string };
    type Spec = CombinedAstSpec<AstA | AstB | AstC>;
    type Expected = AstC;
    type Actual = ParentsOf<Spec, AstA>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should work with vacuous index signature", () => {
    type AstA = { $ast: "A"; value: string };
    type AstB = { $ast: "B"; child: AstA; count: number };
    type AstC = { $ast: "C"; child: { [key: `--${string}`]: string } };
    type Spec = CombinedAstSpec<AstA | AstB | AstC>;
    type Expected = AstB;
    type Actual = ParentsOf<Spec, AstA>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });
});

describe("ApplyOutMap", () => {
  it("should return the same type if no $out properties are present", () => {
    type AstA = { $ast: "A"; value: string };
    type AstB = { $ast: "B"; child: AstA; count: number };
    type AstC = { $ast: "C"; child: AstB[]; name: string };
    type Spec = CombinedAstSpec<AstA | AstB | AstC>;

    const node = {
      $ast: "C",
      child: [{ $ast: "B", child: { $ast: "A", value: "test" }, count: 1 }],
      name: "example",
    } satisfies AstC;

    type Expected = typeof node;
    type Actual = ApplyOutMap<Spec, {}, typeof node>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });

  it("should replace non ast types according to $out properties in spec", () => {
    type AstA = { $in: { $ast: "A"; value: string }; $out: string };
    type AstB = { $ast: "B"; child: AstA["$in"]; count: number };
    type AstC = { $ast: "C"; child: AstB[]; name: string };
    type Spec = CombinedAstSpec<AstA | AstB | AstC>;

    const node = {
      $ast: "C",
      child: [{ $ast: "B", child: { $ast: "A", value: "test" }, count: 1 }],
      name: "example",
    } satisfies AstC;

    type OutMap = {
      A: string;
    };

    type Expected = {
      $ast: "C";
      child: Array<{
        $ast: "B";
        child: string; // AstA is replaced with its $out type
        count: number;
      }>;
      name: string;
    };

    type Actual = ApplyOutMap<Spec, OutMap, typeof node>;
    expectTypeOf<Actual>().toEqualTypeOf<Expected>();
  });
});
