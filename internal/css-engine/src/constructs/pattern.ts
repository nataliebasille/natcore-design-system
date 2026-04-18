import type {
  TwArbitraryCandidate,
  TwBareCandidate,
} from "../dsl/ast/cssvalue/match-value";
import type { ControlledVar } from "./components/types";

type PatternValueToken =
  | string
  | {
      type: "arbitrary";
      dataType: TwArbitraryCandidate["dataType"];
    }
  | {
      type: "bare";
      dataType: TwBareCandidate["dataType"];
    };

type PatternValue = {
  name: string;
  default?: string;
  tokens: ReadonlyArray<PatternValueToken>;
};

export type Pattern = {
  root: string;
  value?: PatternValue;
  modifier?: PatternValue;
};

export function createPattern(
  root: string,
  value: PatternValue | undefined,
  modifier: PatternValue | undefined,
) {
  return {
    root,
    ...(value ? { value } : {}),
    ...(modifier ? { modifier } : {}),
  };
}
