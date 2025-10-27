import { DocPage, DocSection } from "@/components/doc/DocPage";
import { fetchFile } from "@/components/fetch-file";
import { toggle as toggleTheme } from "@nataliebasille/natcore-design-system";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";
import { BasicToggleExample } from "./BasicToggleExample";

const toggleThemeInfo = generateThemeInfo(toggleTheme, {});

export default async function SwitchPage() {
  return (
    <DocPage
      title="Toggle Switch"
      description="Create a horizontal or vertical dividers with optional text. It helps to visually separate sections or content within your user interface."
    >
      <DocSection title="Classes">
        <ThemeClassesContainer theme={toggleThemeInfo} />
      </DocSection>
      <DocSection title="Basic toggle">
        <BasicToggleExample
          html={await fetchFile("components/switch/examples/basic-switch.html")}
        />
      </DocSection>
    </DocPage>
  );
}
