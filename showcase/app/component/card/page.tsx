import { DocPage, DocSection } from "@/components/doc/DocPage";
import { BasicCardExample } from "./BasicCardExample";
import { fetchFile } from "@/components/fetch-file";

export default async function CardPage() {
  return (
    <DocPage title="Card">
      <DocSection title="Basic card">
        <BasicCardExample
          html={await fetchFile("component/card/examples/basic-card.html")}
        />
      </DocSection>
    </DocPage>
  );
}
