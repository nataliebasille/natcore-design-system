import { DocPage, DocSection } from "@/components/doc/DocPage";
import { BasicCardExample } from "./BasicCardExample";
import { fetchFile } from "@/components/fetch-file";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import cardTheme from "../../../../packages/core/src/themes/components/card";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";

const cardThemeInfo = generateThemeInfo(cardTheme, {});

export default async function CardPage() {
  return (
    <DocPage title="Card">
      <DocSection title="Classes">
        <ThemeClassesContainer theme={cardThemeInfo} />
      </DocSection>

      <DocSection title="Basic card">
        <BasicCardExample
          html={await fetchFile("component/card/examples/basic-card.html")}
        />
      </DocSection>
    </DocPage>
  );
}
