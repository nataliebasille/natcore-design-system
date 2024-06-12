import { DocPage, DocSection } from "@/components/doc/DocPage";
import { RadioGroupPlayground } from "./RadioGroupPlayground";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import radioGroupTheme from "../../../../packages/core/src/themes/components/radio-group";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";

const radioGroupThemeInfo = generateThemeInfo(radioGroupTheme, {});

export default function RadioGroupPage() {
  return (
    <DocPage
      title="Radio Group"
      description="Select a single value from a small set of options"
    >
      <DocSection title="Playground">
        <RadioGroupPlayground />
      </DocSection>

      <DocSection title="Classes">
        <ThemeClassesContainer theme={radioGroupThemeInfo} />
      </DocSection>
    </DocPage>
  );
}
