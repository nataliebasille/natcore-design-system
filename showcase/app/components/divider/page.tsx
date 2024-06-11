import { DocPage, DocSection } from "@/components/doc/DocPage";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";
import dividerTheme from "../../../../packages/core/src/themes/components/divider";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import { DividerPlayground } from "./DividerPlayground";
import { InlineClass } from "@/components/InlineClass";
import { Example } from "@/components/doc/Example";
import { BasicContainer } from "@/components/doc/BasicContainer";

const dividerThemeInfo = generateThemeInfo(dividerTheme, {
  divider: "Horizontal line to divide content.",
  "divider-v": "Vertical line to divide content",
  "divider-primary": "Class to apply the primary color to the divider",
  "divider-secondary": "Class to apply the secondary color to the divider",
  "divider-surface": "Class to apply the surface color to the divider",
});

export default function DividerPage() {
  return (
    <DocPage
      title="Divider"
      description="Create a horizontal or vertical dividers with optional text. It helps to visually separate sections or content within your user interface."
    >
      <DocSection title="Playground">
        <DividerPlayground />
      </DocSection>
      <DocSection title="Classes">
        <ThemeClassesContainer theme={dividerThemeInfo} />
      </DocSection>
      <DocSection title="Usage">
        <DocSection
          title="Horizontal divider"
          description={
            <>
              A horizontal divider is created using the{" "}
              <InlineClass className="divider" /> class.
            </>
          }
        >
          <BasicContainer>
            <Example
              html={
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl">top</div>
                  <div className="divider"></div>
                  <div className="text-2xl">bottom</div>
                </div>
              }
            />
          </BasicContainer>
        </DocSection>

        <DocSection title="Horizontal divider with text">
          <BasicContainer>
            <Example
              html={
                <div className="flex flex-col items-center justify-center">
                  <div className="text-2xl">top</div>
                  <div className="divider">OR</div>
                  <div className="text-2xl">bottom</div>
                </div>
              }
            />
          </BasicContainer>
        </DocSection>

        <DocSection
          title="Vertical divider"
          description={
            <>
              A vertical divider is created using the{" "}
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                .divider-v
              </code>{" "}
              class.
            </>
          }
        >
          <BasicContainer>
            <Example
              html={
                <div className="flex items-center justify-center">
                  <div className="text-2xl">left</div>
                  <div className="divider-v h-24"></div>
                  <div className="text-2xl">right</div>
                </div>
              }
            />
          </BasicContainer>
        </DocSection>

        <DocSection title="Vertical divider with text">
          <BasicContainer>
            <Example
              html={
                <div className="flex items-center justify-center">
                  <div className="text-2xl">left</div>
                  <div className="divider-v h-24">OR</div>
                  <div className="text-2xl">right</div>
                </div>
              }
            />
          </BasicContainer>
        </DocSection>
      </DocSection>
    </DocPage>
  );
}
