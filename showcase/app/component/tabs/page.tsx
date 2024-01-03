import { DocPage, DocSection } from "@/components/doc/DocPage";
import tabsTheme from "../../../../packages/core/src/themes/components/tabs";
import { generateThemeInfo } from "@/utlls/generate-theme-info";
import { ThemeClassesContainer } from "@/components/doc/ThemeClassesContainer";
import { ExampleContainer } from "@/components/doc/ExampleContainer";
import { VarientsExample } from "./VarientsExample";

const tabsThemeInfo = generateThemeInfo(tabsTheme, {
  tabs: "Class sets up the basic tabs container",
  tab: "Class to declare content as the label for a tab",
  "tab-content": "Class to declare content as the content for a tab",
  "tabs-primary": "Class to apply the primary color to the tabs",
  "tabs-secondary": "Class to apply the secondary color to the tabs",
  "tabs-tertiary": "Class to apply the tertiary color to the tabs",
  "tabs-surface": "Class to apply the surface color to the tabs",
});

export default function TabsPage() {
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
                className="text-secondary inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.tabs`
              </code>{" "}
              class to create a basic tabs container. To structure the tab
              content, use a radio button, followed by a label with the
              <code
                className="text-secondary inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.tab`
              </code>{" "}
              class, followed by a content with the
              <code
                className="text-secondary inline-block bg-transparent p-0 font-bold"
                style={{ padding: "0 !important" }}
              >
                `.tab-content`
              </code>{" "}
              class.
            </>
          }
        >
          <ExampleContainer
            html={`<div class="tabs">
<input type="radio" id="tab-pasta" name="tabs" checked />
<label class="tab" for="tab-pasta">Pasta</label>
<div class="tab-content">
    <!-- Pasta Recipe -->
    <p>
    Creamy Garlic Parmesan Pasta:
    Boil pasta until al dente. In a separate pan, sauté minced garlic in
    butter. Add heavy cream and grated parmesan. Toss cooked pasta in the
    sauce. Garnish with parsley and serve hot!
    </p>
</div>

<input type="radio" id="tab-pizza" name="tabs" />
<label class="tab" for="tab-pizza">Pizza</label>
<div class="tab-content">
    <!-- Pizza Recipe -->
    <p>
    Margherita Pizza:
    Roll out pizza dough. Spread tomato sauce, mozzarella, and fresh basil
    leaves. Drizzle with olive oil and bake in a preheated oven until the
    crust is golden and the cheese is bubbly. Enjoy a classic Margherita
    pizza!
    </p>
</div>

<input type="radio" id="tab-dessert" name="tabs" />
<label class="tab" for="tab-dessert">Dessert</label>
<div class="tab-content">
    <!-- Dessert Recipe -->
    <p>
    Chocolate Lava Cake:
    Melt chocolate and butter. Whisk in sugar and eggs. Fold in flour and
    cocoa powder. Pour the batter into ramekins. Bake until the edges are
    set but the center is gooey. Serve with a scoop of ice cream. Divine!
    </p>
</div>
</div>`}
          />
        </DocSection>
      </DocSection>

      <DocSection title="Variants">
        <VarientsExample />
      </DocSection>
    </DocPage>
  );
}
