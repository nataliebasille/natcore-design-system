import { DocPage, DocSection } from "@/components/doc/DocPage";
import { BasicCardExample } from "./BasicCardExample";
import { fetchFile } from "@/components/fetch-file";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import cardTheme from "../../../../packages/core/src/themes/components/card";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";
import { DeprecatedExampleContainer } from "@/components/doc/DeprecatedExampleContainer";

const cardThemeInfo = generateThemeInfo(cardTheme, {});

export default async function CardPage() {
  return (
    <DocPage title="Card" description="Container to section off content">
      <DocSection title="Classes">
        <ThemeClassesContainer theme={cardThemeInfo} />
      </DocSection>

      <DocSection title="Basic card">
        <BasicCardExample
          html={await fetchFile("components/card/examples/basic-card.html")}
        />
      </DocSection>

      <DocSection
        title="Card sections"
        description={
          <>
            A card can be divided into sections using{" "}
            <code
              className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
              style={{ padding: "0 !important" }}
            >
              `.card-header`
            </code>{" "}
            and{" "}
            <code
              className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
              style={{ padding: "0 !important" }}
            >
              `.card-footer`
            </code>{" "}
            classes
          </>
        }
      >
        <DeprecatedExampleContainer
          outputClassName="justify-items-center"
          html={await fetchFile("components/card/examples/sections.html")}
        />
      </DocSection>
    </DocPage>
  );
}
