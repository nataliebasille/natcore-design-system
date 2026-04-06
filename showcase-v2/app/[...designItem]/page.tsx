import { renderToUi } from "@nataliebasille/preview-jsx-runtime";
import { getSpotlights } from "@/server/get-spotlights";
import {
  getTailwindModule,
  listTailwindModules,
} from "@/server/get-tailwind-modules";
import { DocPage, DocSection } from "@/ui/doc/DocPage";
import { Spotlight } from "@/ui/doc/spotlight";

export async function generateStaticParams() {
  const modules = await listTailwindModules();
  return modules
    .filter((x) => !!x.doc)
    .map((m) => ({ designItem: [m.category, m.name] }));
}

export default async function DesignItemPage({
  params,
}: PageProps<"/[...designItem]">) {
  const { designItem } = await params;
  const [category, name] = designItem as [string, string];

  const entry = await getTailwindModule({ category, name });

  if (!entry.doc) {
    throw new Error(`Documentation not found for module "${category}/${name}"`);
  }

  const { doc } = entry;
  const spotlights = await getSpotlights(entry);

  return (
    <DocPage title={normalizeName(entry.name)} description={doc.description}>
      {/* ── At a glance ── */}
      {spotlights?.atAGlance && (
        <DocSection title="At a glance">
          <Spotlight>{renderToUi(spotlights.atAGlance)}</Spotlight>
        </DocSection>
      )}
    </DocPage>
  );
}

function normalizeName(name: string) {
  const parts = name.split("-") as [string, ...string[]];

  return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)}${parts.length > 1 ? ` ${parts.slice(1).join(" ")}` : ""}`;
}
