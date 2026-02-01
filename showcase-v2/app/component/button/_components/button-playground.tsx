import { Playground } from "@/app/_ui/playground/playground";
import { controls, defaultValues } from "./button-playground-controls";
import { ButtonPlaygroundResult } from "./button-playground-result";

export function ButtonPlayground() {
  return (
    <Playground defaultValues={defaultValues} controls={controls}>
      <ButtonPlaygroundResult />
    </Playground>
  );
}
