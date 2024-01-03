import { DocPage, DocSection } from "@/components/doc/DocPage";
import { ExampleContainer } from "@/components/doc/ExampleContainer";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import listTheme from "../../../../packages/core/src/themes/components/list";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";

const listThemeInfo = generateThemeInfo(listTheme, {
  list: "This class sets up the basic list layout and style.",
  "list-disc": "This class applies disc bullets to the list items.",
  "list-decimal": "This class applies decimal numbering to the list items.",
  "list-primary": "This class applies the primary color to the list items.",
  "list-secondary": "This class applies the secondary color to the list items.",
  "list-tertiary": "This class applies the tertiary color to the list items.",
  "list-surface": "This class applies the surface color to the list items.",
  "list-item": "This class represents the individual list items.",
  active: "Use this class to style the active list item.",
});

export default function ListPage() {
  return (
    <DocPage
      title="List"
      description="The list component is a flexible and customizable component that allows you to create lists with various styles and formats. "
    >
      <DocSection title="Classes">
        <ThemeClassesContainer theme={listThemeInfo} />
      </DocSection>
      <DocSection title="Usage">
        <DocSection
          title="Basic list"
          description={
            <>
              Use the{" "}
              <code
                className="text-secondary inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.list`
              </code>{" "}
              class to create a basic list with default styling
            </>
          }
        >
          <ExampleContainer
            html={`<ul class="list">
    <li class="list-item">Item 1</li>
    <li class="list-item">Item 2</li>
    <li class="list-item">Item 3</li>
</ul>`}
          />
        </DocSection>

        <DocSection
          title="Selected list item"
          description={
            <>
              List item can appear selected using the{" "}
              <code
                className="text-secondary inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                .active
              </code>{" "}
              class.
            </>
          }
        >
          <ExampleContainer
            html={`<ul class="list">
    <li class="list-item">Item 1</li>
    <li class="list-item active">Item 2</li>
    <li class="list-item">Item 3</li>
</ul>`}
          />
        </DocSection>
      </DocSection>
    </DocPage>
  );
}
