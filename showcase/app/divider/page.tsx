import { DocPage, DocSection } from "@/components/doc/DocPage";
import { ExampleContainer } from "@/components/doc/ExampleContainer";

export default function DividerPage() {
  return (
    <DocPage
      title="Divider"
      description="Create a horizontal or vertical dividers with optional text. It helps to visually separate sections or content within your user interface."
    >
      <DocSection title="Usage">
        <DocSection
          title="Horizontal divider"
          description={
            <>
              A horizontal divider is created using the{" "}
              <code
                className="text-primary inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                .divider
              </code>{" "}
              class.
            </>
          }
        >
          <ExampleContainer
            gridColumns={1}
            html={`<div class="divider"></div>`}
          />
        </DocSection>

        <DocSection title="Horizontal divider with text">
          <ExampleContainer
            gridColumns={1}
            html={`<div class="divider">My text</div>`}
          />
        </DocSection>
      </DocSection>
    </DocPage>
  );
}
