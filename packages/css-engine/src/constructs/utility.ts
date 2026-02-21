import { cssv } from "../dsl/public";

export function staticUtility<T extends string>(name: T) {}

export function dynamicUtility<
  T extends string,
  P extends Record<string, unknown>,
>(value: T, params: P) {}
