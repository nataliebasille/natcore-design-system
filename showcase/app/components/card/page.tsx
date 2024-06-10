import { DocPage, DocSection } from "@/components/doc/DocPage";
import { CardPlayground } from "./CardPlayground";
import { fetchFile } from "@/components/fetch-file";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import cardTheme from "../../../../packages/core/src/themes/components/card";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";
import { Example } from "@/components/doc/Example";
import { InlineClass } from "@/components/InlineClass";
import { BasicContainer } from "@/components/doc/BasicContainer";
import { List } from "@natcore/design-system-react";

const cardThemeInfo = generateThemeInfo(cardTheme, {
  card: "Apply the card layout and style to the card cotainer.",
  "card-primary": "Apply the primary card appearance.",
  "card-secondary": "Apply the secondary card appearance.",
  "card-surface": "Apply the surface card appearance.",
  "card-accent": "Apply the accent card appearance.",
  "card-hover": "Apply the hover state of the card.",
  "card-header": "Apply the header of the card.",
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore TODO: Fix typings
  "card-content": "Apply the content of the card.",
  "card-footer": "Apply the footer of the card.",
  "card-soft": "Apply the soft card appearance.",
  "card-filled": "Apply the filled card appearance.",
  "card-ghost": "Apply the ghost card appearance.",
});

export default async function CardPage() {
  return (
    <DocPage title="Card" description="Container to section off content">
      <DocSection
        title="Playground"
        description={
          <>
            Use the <InlineClass className="card" /> class to create a basic
            card with default styling.
          </>
        }
      >
        <CardPlayground
          html={await fetchFile("components/card/examples/playground.html")}
        />
      </DocSection>

      <DocSection title="Classes">
        <ThemeClassesContainer theme={cardThemeInfo} />
      </DocSection>

      <DocSection title="Usage">
        <DocSection
          title="Card sections"
          description={
            <>
              A card can be divided into sections using{" "}
              <InlineClass className="card-header" /> and{" "}
              <InlineClass className="card-footer" /> classes.
            </>
          }
        >
          <BasicContainer>
            <Example
              html={await fetchFile("components/card/examples/sections.html")}
            />
          </BasicContainer>
        </DocSection>

        <DocSection
          title="Variants"
          description={
            <>
              Bultin card themes are applied using one of the following classes:
              <List.UL className="my-2 ml-3">
                <List.Item>
                  <InlineClass className="card-primary" />
                </List.Item>
                <List.Item>
                  <InlineClass className="card-secondary" />
                </List.Item>
                <List.Item>
                  <InlineClass className="card-surface" />
                </List.Item>
                <List.Item>
                  <InlineClass className="card-accent" />
                </List.Item>
              </List.UL>
              The default theme is <InlineClass className="card-surface" />.
            </>
          }
        >
          <BasicContainer>
            <Example
              html={await fetchFile("components/card/examples/variants.html")}
            />
          </BasicContainer>
        </DocSection>

        <DocSection
          title="Appearances"
          description={
            <>
              Card appearance can be changed using one of the following classes:
              <List.UL className="my-2 ml-3">
                <List.Item>
                  <InlineClass className="card-soft" />
                </List.Item>
                <List.Item>
                  <InlineClass className="card-filled" />
                </List.Item>
                <List.Item>
                  <InlineClass className="card-ghost" />
                </List.Item>
              </List.UL>
              The default appearance is <InlineClass className="card-soft" />.
            </>
          }
        >
          <BasicContainer>
            <Example
              html={await fetchFile("components/card/examples/appearance.html")}
            />
          </BasicContainer>
        </DocSection>
      </DocSection>
    </DocPage>
  );
}
