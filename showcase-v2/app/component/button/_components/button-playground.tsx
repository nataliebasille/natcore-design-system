import { Playground } from "@/app/_ui/playground/playground";
import {
  ButtonPlaygroundControls,
  defaultValues,
} from "./button-playground-controls";
import { ButtonPlaygroundPreview } from "./button-playground-preview";
import { renderMarkup } from "./render-markup";

export function ButtonPlayground() {
  return (
    <h1 className="text-2xl font-bold mb-4">Button Playground Placeholder</h1>
    // <Playground
    //   defaultValues={defaultValues}
    //   controls={<ButtonPlaygroundControls />}
    //   preview={<ButtonPlaygroundPreview />}
    //   renderMarkup={renderMarkup}
    // />
  );
}
