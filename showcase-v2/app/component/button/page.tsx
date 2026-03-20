import { DocPage, DocSection } from "@/app/_ui/doc/DocPage";
import { StaticExample } from "@/app/_ui/example/static-example";
import { Spotlight } from "@/ui/doc/spotlight.tsx";
import { UtilityReference, UtilityValue } from "@/ui/doc/utility-reference.tsx";
import { ButtonPlayground } from "./_components/button-playground";
import buttonCss from "../../../../packages/core-v2/src/tailwind/components/button.css.ts";
import { CssFileReference } from "@/app/_ui/doc/construct-reference";
import { ShowcaseSpotlight } from "@/ui/doc/showcase-spotlight.tsx";
import {
  buttonGroup,
  GhostPaletteShowcase,
  IconButtonsShowcase,
  OutlinePaletteShowcase,
  SizesShowcase,
  SoftPaletteShowcase,
  SolidPaletteShowcase,
} from "./_showcase.tsx";

export default async function ButtonPage() {
  return (
    <DocPage
      title="Button"
      description="Composable button utilities: pick a variant, a tone, and a size. Everything else (hover, focus, active) is built in."
    >
      {/* ── At a glance ── */}
      <DocSection title="At a glance">
        <Spotlight>
          <div className="flex flex-wrap gap-2 items-center">
            <button className="btn-solid/primary">Solid</button>
            <button className="btn-soft/secondary">Soft</button>
            <button className="btn-outline/accent">Outline</button>
            <button className="btn-ghost/surface">Ghost</button>
            <button className="btn-soft/surface btn-size-sm">Small</button>
            <button className="btn-soft/secondary btn-size-lg">Large</button>
          </div>
        </Spotlight>
      </DocSection>

      {/* ── Playground ── */}
      <DocSection title="Playground">
        <ButtonPlayground />
      </DocSection>

      {/* ── btn ── */}
      <DocSection title="Button">
        <CssFileReference
          constructs={buttonCss}
          for="btn"
          description="Applies button styling using the selected variant and tone palette."
        />

        <StaticExample.FromShowcaseJsx
          title="Solid"
          source={SolidPaletteShowcase()}
        />

        <StaticExample.FromShowcaseJsx
          title="Soft"
          source={SoftPaletteShowcase()}
        />

        <StaticExample.FromShowcaseJsx
          title="Outline"
          source={OutlinePaletteShowcase()}
        />

        <StaticExample.FromShowcaseJsx
          title="Ghost"
          source={GhostPaletteShowcase()}
        />
      </DocSection>

      {/* ── btn-group ── */}
      <DocSection title="Button Group">
        <CssFileReference
          constructs={buttonCss}
          for="btn-group"
          description="Groups adjacent buttons into a visually connected row sharing a variant style and tone palette."
        />

        <StaticExample.FromShowcaseJsx
          title="Solid"
          source={buttonGroup.solid}
        />
        <StaticExample.FromShowcaseJsx title="Soft" source={buttonGroup.soft} />
        <StaticExample.FromShowcaseJsx
          title="Outline"
          source={buttonGroup.outline}
        />
        <StaticExample.FromShowcaseJsx
          title="Ghost"
          source={buttonGroup.ghost}
        />
      </DocSection>

      {/* ── btn-size ── */}
      <DocSection title="Sizes">
        <CssFileReference
          constructs={buttonCss}
          for="btn-size"
          description="Controls the padding and font size of a button. Composes with any btn variant."
        />

        <StaticExample.FromShowcaseJsx source={SizesShowcase()} />
      </DocSection>

      {/* ── btn-icon ── */}
      <DocSection title="Icon Buttons">
        <CssFileReference
          constructs={buttonCss}
          for="btn-icon"
          description="Modifier utility to create square, fully-rounded icon buttons by equalizing inline and block padding. Composes with any btn variant and size."
        />
        <StaticExample.FromShowcaseJsx source={IconButtonsShowcase()} />
      </DocSection>
    </DocPage>
  );
}
