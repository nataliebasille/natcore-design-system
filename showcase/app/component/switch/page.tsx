import { DocPage, DocSection } from "@/components/doc/DocPage";
import { ExampleContainer } from "@/components/doc/ExampleContainer";
import { fetchFile } from "@/components/fetch-file";

export default async function SwitchPage() {
  return (
    <DocPage
      title="Toggle Switch"
      description="Create a horizontal or vertical dividers with optional text. It helps to visually separate sections or content within your user interface."
    >
      <DocSection title="Classes">
        {/* <ThemeClassesContainer theme={dividerThemeInfo} /> */}
      </DocSection>
      <DocSection title="Usage">
        <ExampleContainer
          html={await fetchFile("component/switch/examples/basic-switch.html")}
        />
      </DocSection>
    </DocPage>
  );
}
