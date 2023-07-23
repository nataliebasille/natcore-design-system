import { DocPage, DocSection } from "@/components/doc/DocPage";
import { ExampleContainer } from "@/components/doc/ExampleContainer";

export default function DividerPage() {
  return (
    <DocPage
      title="Divider"
      description="Create a horizontal or vertical dividers with optional text. It helps to visually separate sections or content within your user interface."
    >
      <DocSection title="Classes"></DocSection>
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
            html={`<div class="flex flex-col items-center justify-center">
    <div class="text-2xl">top</div>
    <div class="divider"></div>
    <div class="text-2xl">bottom</div>
</div>`}
          />
        </DocSection>

        <DocSection title="Horizontal divider with text">
          <ExampleContainer
            gridColumns={1}
            html={`<div class="flex flex-col items-center justify-center">
    <div class="text-2xl">top</div>
    <div class="divider">OR</div>
    <div class="text-2xl">bottom</div>
</div>`}
          />
        </DocSection>

        <DocSection
          title="Vertical divider"
          description={
            <>
              A vertical divider is created using the{" "}
              <code
                className="text-primary inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                .divider-v
              </code>{" "}
              class.
            </>
          }
        >
          <ExampleContainer
            gridColumns={1}
            html={`<div class="flex items-center justify-center">
    <div class="text-2xl">left</div>
    <div class="divider-v h-24"></div>
    <div class="text-2xl">right</div>
</div>`}
          />
        </DocSection>

        <DocSection title="Vertical divider with text">
          <ExampleContainer
            gridColumns={1}
            html={`<div class="flex items-center justify-center">
    <div class="text-2xl">left</div>
    <div class="divider-v h-24">OR</div>
    <div class="text-2xl">right</div>
</div>`}
          />
        </DocSection>
      </DocSection>
    </DocPage>
  );
}
