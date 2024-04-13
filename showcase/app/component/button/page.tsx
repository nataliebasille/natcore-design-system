import { DocPage, DocSection } from "@/components/doc/DocPage";
import { ExampleContainer } from "@/components/doc/ExampleContainer";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import buttonTheme from "../../../../packages/core/src/themes/components/button";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";
import { BasicButtonExample } from "./BasicButtonExample";
import { fetchFile } from "@/components/fetch-file";

const btnThemeInfo = generateThemeInfo(buttonTheme, {
  btn: "Button with default styling",
  "btn-outline": "Transparent button with colored borders",
  "btn-icon": "Button designed specifically to contain an icon",
  "btn-primary": "Uses the primary button styles",
  "btn-secondary": "Uses the secondary button styles",
  "btn-surface": "Uses the surface button styles",
  "btn-ghost": "Uses the ghost button styles",
  "btn-sm": "Small-sized button",
  "btn-lg": "Large-sized button",
});

export default async function ButtonPage() {
  return (
    <DocPage
      title="Button"
      description="A customizable button component that comes with different variants,
  sizes, and styles."
    >
      <DocSection title="Classes">
        <ThemeClassesContainer theme={btnThemeInfo} />
      </DocSection>
      <DocSection title="Usage">
        <DocSection
          title="Basic button"
          description={
            <>
              Button styles are applied using the{" "}
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.btn`
              </code>{" "}
              prefix.
            </>
          }
        >
          <BasicButtonExample
            html={await fetchFile(
              "component/button/examples/basic-button.html",
            )}
          />
        </DocSection>

        <DocSection
          title="Sizes"
          description={
            <>
              Button sizes are applied using the{" "}
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.btn-sm`
              </code>{" "}
              (small) or{" "}
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.btn-lg`
              </code>{" "}
              (large) classes.
            </>
          }
        >
          <ExampleContainer
            html={await fetchFile("component/button/examples/sizes.html")}
          />
        </DocSection>

        {/* 
        

        <DocSection
          title="Icon buttons"
          description={
            <>
              To create a icon friendly button, use the{" "}
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.btn-icon`
              </code>{" "}
              class.
            </>
          }
        >
          <div className="border-primary-500 rounded-lg border p-3">
            <Highlight
              component="code"
              content={`<button class="btn btn-icon btn-sm">{...icon}</button>
<button class="btn btn-icon btn-sm btn-outline">{...icon}</button>
<button class="btn btn-icon">{...icon}</button>
<button class="btn btn-icon btn-outline">{...icon}</button>
<button class="btn btn-icon btn-lg">{...icon}</button>
<button class="btn btn-icon btn-lg btn-outline">{...icon}</button>`}
              language="html"
            />
            <div className="divider mb-2">Output</div>

            <div
              className="grid items-center justify-items-center gap-3"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))",
              }}
            >
              <button className="btn btn-icon btn-sm">
                <LogoSVG />
              </button>
              <button className="btn btn-icon btn-sm btn-outline">
                <LogoSVG />
              </button>
              <button className="btn btn-icon">
                <LogoSVG />
              </button>
              <button className="btn btn-icon btn-outline">
                <LogoSVG />
              </button>
              <button className="btn btn-icon btn-lg">
                <LogoSVG />
              </button>
              <button className="btn btn-icon btn-lg btn-outline">
                <LogoSVG />
              </button>
            </div>
          </div>
        </DocSection> */}
      </DocSection>
    </DocPage>
  );
}
