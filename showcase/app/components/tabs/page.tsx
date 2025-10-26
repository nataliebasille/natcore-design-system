import { DocPage, DocSection } from "@/components/doc/DocPage";
import { tabs as tabsTheme} from "@natcore/design-system-core";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";
import { DeprecatedExampleContainer } from "@/components/doc/DeprecatedExampleContainer";
import { VarientsExample } from "./VarientsExample";
import { fetchFile } from "@/components/fetch-file";

const tabsThemeInfo = generateThemeInfo(tabsTheme, {
  tabs: "Class sets up the basic tabs container",
  tab: "Class to declare content as the label for a tab",
  "tab-content": "Class to declare content as the content for a tab",
  "tabs-primary": "Class to apply the primary color to the tabs",
  "tabs-secondary": "Class to apply the secondary color to the tabs",
  "tabs-surface": "Class to apply the surface color to the tabs",
});

export default async function TabsPage() {
  return (
    <DocPage
      title="Tabs"
      description="Switch between different content without any javascript."
    >
      <DocSection title="Classes">
        <ThemeClassesContainer theme={tabsThemeInfo} />
      </DocSection>

      <DocSection title="Usage">
        <DocSection
          title="Basic tabs"
          description={
            <>
              Use the{" "}
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.tabs`
              </code>{" "}
              class to create a basic tabs container. To structure the tab
              content, use a radio button, followed by a label with the
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.tab`
              </code>{" "}
              class, followed by a content with the
              <code
                className="text-secondary-800 inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.tab-content`
              </code>{" "}
              class.
            </>
          }
        >
          <DeprecatedExampleContainer
            html={await fetchFile("components/tabs/examples/basic.html")}
          />
        </DocSection>
      </DocSection>

      <DocSection title="Variants">
        <VarientsExample
          html={await fetchFile("components/tabs/examples/variants.html")}
        />
      </DocSection>
    </DocPage>
  );
}
