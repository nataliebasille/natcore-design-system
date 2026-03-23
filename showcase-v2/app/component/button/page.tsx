import { DocPage, DocSection } from "@/app/_ui/doc/DocPage";
import { StaticExample } from "@/app/_ui/example/static-example";
import { Spotlight } from "@/ui/doc/spotlight.tsx";
import { UtilityReference, UtilityValue } from "@/ui/doc/utility-reference.tsx";
import { ButtonPlayground } from "./_components/button-playground";
import buttonCss from "../../../../packages/core-v2/src/tailwind/components/button.css.ts";
import { CssFileReference } from "@/app/_ui/doc/construct-reference";
import { CssApiReference } from "@/app/_ui/doc/api-reference";
import {
  ArbitrarySizeShowcase,
  buttonGroup,
  CssVarSizeShowcase,
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
          <div className="flex flex-wrap items-center gap-2">
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

        <StaticExample.FromShowcaseJsx
          title="Arbitrary sizes (btn-size-[value])"
          source={ArbitrarySizeShowcase()}
        />
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

      {/* ── CSS variables ── */}
      <DocSection title="CSS Variables">
        <UtilityReference
          tags={["css-variable"]}
          description="These CSS variables control the button's scale and spacing. Override them inline or in your own CSS to fine-tune size without creating new variants."
          table={[
            {
              label: "--btn-size",
              content: (
                <span>
                  Base font size and scale factor — padding and gap are derived
                  from this value.{" "}
                  <span className="text-tone-500-accent">Default: 1rem</span>
                </span>
              ),
            },
            {
              label: "--btn-px",
              content: (
                <span>
                  Inline (horizontal) padding. Override directly to decouple
                  from <code>--btn-size</code>.{" "}
                  <span className="text-tone-500-accent">
                    Default: --btn-size × 0.8
                  </span>
                </span>
              ),
            },
            {
              label: "--btn-py",
              content: (
                <span>
                  Block (vertical) padding. Override directly to decouple from{" "}
                  <code>--btn-size</code>.{" "}
                  <span className="text-tone-500-accent">
                    Default: --btn-size × 0.5
                  </span>
                </span>
              ),
            },
            {
              label: "--btn-gap",
              content: (
                <span>
                  Gap between content elements (e.g. icon + label).{" "}
                  <span className="text-tone-500-accent">
                    Default: --btn-size × 0.2
                  </span>
                </span>
              ),
            },
          ]}
        />
        <StaticExample.FromShowcaseJsx
          title="--btn-size (0.625rem / default / 1.5rem)"
          source={CssVarSizeShowcase()}
        />
      </DocSection>

      {/* ── API Reference ── */}
      <DocSection title="API Reference">
        <CssApiReference
          constructs={buttonCss}
          classes={[
            {
              name: "btn",
              description:
                "Composable button. Pick a variant and a tone palette. Hover, focus-visible ring, and active press states are all built in.",
            },
            {
              name: "btn-group",
              description:
                "Groups adjacent buttons or labelled radio/checkbox inputs into a visually connected row sharing a variant and tone. The checked item receives the active palette automatically.",
            },
            {
              name: "btn-size",
              description:
                "Sets the base font size of the button. Padding and gap scale proportionally from this value. Use a named preset or any arbitrary length with btn-size-[value].",
            },
            {
              name: "btn-icon",
              description:
                "Makes a button square and fully rounded - ideal for icon-only buttons. Overrides padding to --btn-size x 0.5 on both axes.",
            },
          ]}
          cssVars={[
            {
              name: "--btn-size",
              description:
                "Base font size and scale factor for padding and gap.",
              default: "1rem",
            },
            {
              name: "--btn-px",
              description:
                "Inline (horizontal) padding. Override to decouple from --btn-size.",
              default: "--btn-size x 0.8",
            },
            {
              name: "--btn-py",
              description:
                "Block (vertical) padding. Override to decouple from --btn-size.",
              default: "--btn-size x 0.5",
            },
            {
              name: "--btn-gap",
              description: "Gap between content elements (e.g. icon + label).",
              default: "--btn-size x 0.2",
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
