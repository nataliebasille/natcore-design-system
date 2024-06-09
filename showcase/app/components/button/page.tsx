import { DocPage, DocSection } from "@/components/doc/DocPage";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import buttonTheme from "../../../../packages/core/src/themes/components/button";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";
import { ButtonPlaygroundExample } from "./ButtonPlaygroundExample";
import { fetchFile } from "@/components/fetch-file";
import { InlineClass } from "@/components/InlineClass";
import { BasicContainer } from "@/components/doc/BasicContainer";
import { List } from "../../../../packages/react/src/List";
import { Example } from "@/components/doc/Example";

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
      <DocSection
        title="Playground"
        description={
          <>
            Button styles are applied using the either the{" "}
            <InlineClass className="btn" /> or the{" "}
            <InlineClass className="btn-icon" /> class.
          </>
        }
      >
        <BasicContainer>
          <ButtonPlaygroundExample
            html={await fetchFile("components/button/examples/playground.html")}
          />
        </BasicContainer>
      </DocSection>
      <DocSection title="Classes">
        <ThemeClassesContainer theme={btnThemeInfo} />
      </DocSection>
      <DocSection title="Usage">
        <DocSection
          title="Variants"
          description={
            <>
              Bultin button themes are applied using one of the following
              classes:
              <List.UL className="my-2 ml-3">
                <List.Item>
                  <InlineClass className="btn-primary" />
                </List.Item>
                <List.Item>
                  <InlineClass className="btn-secondary" />
                </List.Item>
                <List.Item>
                  <InlineClass className="btn-surface" />
                </List.Item>
                <List.Item>
                  <InlineClass className="btn-accent" />
                </List.Item>
              </List.UL>
              The default theme is <InlineClass className="btn-primary" />.
            </>
          }
        >
          <BasicContainer>
            <Example
              html={await fetchFile("components/button/examples/theme.html")}
            />
          </BasicContainer>
        </DocSection>

        <DocSection
          title="Appearance"
          description={
            <>
              Button appearance can be changed using one of the following
              classes:
              <List.UL className="my-2 ml-3">
                <List.Item>
                  <InlineClass className="btn-filled" />
                </List.Item>
                <List.Item>
                  <InlineClass className="btn-outline" />
                </List.Item>
                <List.Item>
                  <InlineClass className="btn-ghost" />
                </List.Item>
              </List.UL>
              The default appearance is <InlineClass className="btn-filled" />.
            </>
          }
        >
          <BasicContainer>
            <Example
              html={await fetchFile(
                "components/button/examples/appearance.html",
              )}
            />
          </BasicContainer>
        </DocSection>

        <DocSection
          title="Sizes"
          description={
            <>
              You can change the size of a button using one of the following:
              <List.UL className="ml-3 mt-2">
                <List.Item>
                  <InlineClass className="btn-sm" /> for a smaller button
                </List.Item>
                <List.Item>
                  <InlineClass className="btn-lg" /> for a larger button
                </List.Item>
              </List.UL>
            </>
          }
        >
          <BasicContainer>
            <Example
              html={await fetchFile("components/button/examples/sizes.html")}
            />
          </BasicContainer>
        </DocSection>

        <DocSection
          title="Icon buttons"
          description={
            <>
              To create a icon friendly button, use the{" "}
              <InlineClass className="btn-icon" /> class.
            </>
          }
        >
          <BasicContainer>
            <Example
              html={await fetchFile(
                "components/button/examples/icon-button.html",
              )}
            />
          </BasicContainer>
        </DocSection>
      </DocSection>
    </DocPage>
  );
}
