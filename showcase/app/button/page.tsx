import { Highlight } from "@/components/Highlight";
import { DocPage, DocSection } from "@/components/doc/DocPage";
import { ExampleContainer } from "@/components/doc/ExampleContainer";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import { LogoSVG } from "@natcore/design-system-core";
import buttonTheme from "../../../packages/core/src/themes/components/button";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";

const btnThemeInfo = generateThemeInfo(buttonTheme, {
  btn: "Button with default styling",
  "btn-outline": "Transparent button with colored borders",
  "btn-icon": "Button designed specifically to contain an icon",
  "btn-primary": "Uses the primary button styles",
  "btn-secondary": "Uses the secondary button styles",
  "btn-tertiary": "Uses the tertiary button styles",
  "btn-accent": "Uses the accent button styles",
  "btn-surface": "Uses the surface button styles",
  "btn-ghost": "Uses the ghost button styles",
  "btn-sm": "Small-sized button",
  "btn-lg": "Large-sized button",
});

export default function ButtonPage() {
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
                className="text-secondary inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.btn`
              </code>{" "}
              prefix.
            </>
          }
        >
          <ExampleContainer
            html={`<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-tertiary">Tertiary</button>
<button class="btn btn-accent">Accent</button>
<button class="btn btn-surface">Surface</button>
<button class="btn btn-ghost">Ghost</button>`}
          />
        </DocSection>

        <DocSection
          title="Outlined button"
          description={
            <>
              A button with a transparent background with a visible border.
              Styles are applied using the{" "}
              <code
                className="text-secondary inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.btn-outline`
              </code>{" "}
              class.
            </>
          }
        >
          <ExampleContainer
            html={`<button class="btn btn-primary btn-outline">Primary</button>
<button class="btn btn-secondary btn-outline">Secondary</button>
<button class="btn btn-tertiary btn-outline">Tertiary</button>
<button class="btn btn-accent btn-outline">Accent</button>
<button class="btn btn-surface btn-outline">Surface</button>
<button class="btn btn-ghost btn-outline">Ghost</button>`}
          />
        </DocSection>

        <DocSection
          title="Sizes"
          description={
            <>
              Button sizes are applied using the{" "}
              <code
                className="text-secondary inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.btn-sm`
              </code>{" "}
              (small) or{" "}
              <code
                className="text-secondary inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.btn-lg`
              </code>{" "}
              (large) classes.
            </>
          }
        >
          <ExampleContainer
            html={`<button class="btn btn-sm">Small</button>
<button class="btn">Standard</button>
<button class="btn btn-lg">Large</button>
<button class="btn btn-sm btn-outline">Small</button>
<button class="btn btn-outline">Standard</button>
<button class="btn btn-lg btn-outline">Large</button>`}
          />
        </DocSection>

        <DocSection
          title="Icon buttons"
          description={
            <>
              To create a icon friendly button, use the{" "}
              <code
                className="text-secondary inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.btn-icon`
              </code>{" "}
              class.
            </>
          }
        >
          <div className="border-primary-shades-500 rounded-lg border p-3">
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
        </DocSection>
      </DocSection>
    </DocPage>
  );
}
