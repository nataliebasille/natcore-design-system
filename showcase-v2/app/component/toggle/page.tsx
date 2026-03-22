import { DocPage, DocSection } from "@/app/_ui/doc/DocPage";
import { StaticExample } from "@/app/_ui/example/static-example";
import { Spotlight } from "@/ui/doc/spotlight.tsx";
import { UtilityReference, UtilityValue } from "@/ui/doc/utility-reference.tsx";
import { CssFileReference } from "@/app/_ui/doc/construct-reference";
import { CssApiReference } from "@/app/_ui/doc/api-reference";
import { TogglePlayground } from "./_components/toggle-playground";
import toggleCss from "../../../../packages/core-v2/src/tailwind/components/toggle.css.ts";
import {
  SolidPaletteShowcase,
  SoftPaletteShowcase,
  OutlinePaletteShowcase,
  GhostPaletteShowcase,
  CheckboxToggleShowcase,
  AriaCheckedToggleShowcase,
  ActiveClassToggleShowcase,
  ThumbSlotShowcase,
  CustomVariantsShowcase,
  CssVarHeightShowcase,
  CssVarPaddingShowcase,
} from "./_showcase.tsx";

export default async function TogglePage() {
  return (
    <DocPage
      title="Toggle"
      description="A CSS-only toggle switch built on a native checkbox. Pick a variant and a palette — hover, focus, and the checked transition are all included."
    >
      {/* ── At a glance ── */}
      <DocSection title="At a glance">
        <Spotlight>
          <div className="flex flex-wrap items-center gap-3">
            <label className="toggle-solid/primary">
              <input type="checkbox" />
            </label>
            <label className="toggle-soft/secondary">
              <input type="checkbox" defaultChecked />
            </label>
            <label className="toggle-outline/accent">
              <input type="checkbox" />
            </label>
            <label className="toggle-ghost/surface">
              <input type="checkbox" defaultChecked />
            </label>
          </div>
        </Spotlight>
      </DocSection>

      {/* ── Playground ── */}
      <DocSection title="Playground">
        <TogglePlayground />
      </DocSection>

      {/* ── toggle ── */}
      <DocSection title="Toggle">
        <CssFileReference
          constructs={toggleCss}
          for="toggle"
          description="Applies toggle styling using the selected variant and tone palette."
        />

        <UtilityReference
          description="The toggle has two built-in default states driven by the active palette. No extra classes are needed — these are applied automatically."
          table={[
            {
              label: "On (checked)",
              content: "Renders with the current palette.",
            },
            {
              label: "Off (unchecked)",
              content: "Renders with the disabled palette (palette-disabled).",
            },
          ]}
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

      {/* ── Toggle triggers ── */}
      <DocSection
        title="Toggle Triggers"
        description="Pick the pattern that fits your stack. A native checkbox inside a label requires no JavaScript. An aria-checked attribute works for accessible custom controls. The .toggle-active class handles JavaScript-driven state."
      >
        <StaticExample.FromShowcaseJsx
          title="Label + Checkbox"
          source={CheckboxToggleShowcase()}
        />
        <StaticExample.FromShowcaseJsx
          title="Button + aria-checked"
          source={AriaCheckedToggleShowcase()}
        />
        <StaticExample.FromShowcaseJsx
          title=".toggle-active class"
          source={ActiveClassToggleShowcase()}
        />
      </DocSection>

      {/* ── Thumb slot ── */}
      <DocSection title="Thumb Slot">
        <UtilityReference
          tags={["slot"]}
          description="An optional child element with the class toggle-thumb can be placed inside the label to customise the movable thumb. When present it replaces the default ::before pseudo-element, letting you embed icons or other content."
          table={[
            {
              label: "Class",
              content: <UtilityValue values={[".toggle-thumb"]} />,
            },
          ]}
        />
        <StaticExample.FromShowcaseJsx source={ThumbSlotShowcase()} />
      </DocSection>

      {/* ── CSS variables ── */}
      <DocSection title="CSS Variables">
        <UtilityReference
          tags={["css-variable"]}
          description="These CSS variables control the toggle's dimensions. Override them inline or in your own CSS to customize size without adding new variants."
          table={[
            {
              label: "--toggle-h",
              content: (
                <span>
                  Height of the toggle track.{" "}
                  <span className="text-tone-500-accent">Default: 1.75rem</span>
                </span>
              ),
            },
            {
              label: "--toggle-p",
              content: (
                <span>
                  Inner padding between the track edge and the thumb.{" "}
                  <span className="text-tone-500-accent">
                    Default: --toggle-h × 0.125
                  </span>
                </span>
              ),
            },
          ]}
        />

        <StaticExample.FromShowcaseJsx
          title="--toggle-h (1.25rem / default / 2.5rem)"
          source={CssVarHeightShowcase()}
        />

        <StaticExample.FromShowcaseJsx
          title="--toggle-p (0 / default / 0.35rem)"
          source={CssVarPaddingShowcase()}
        />
      </DocSection>

      {/* ── Custom variants ── */}
      <DocSection title="Custom Variants">
        <UtilityReference
          description="Two scoped Tailwind variants let you apply styles conditionally based on the toggle state, without any JavaScript."
          table={[
            {
              label: "toggle-on:",
              content: "Applies when the checkbox is checked (toggle is on).",
            },
            {
              label: "toggle-off:",
              content:
                "Applies when the checkbox is unchecked (toggle is off).",
            },
          ]}
        />
        <StaticExample.FromShowcaseJsx
          title="toggle-off:palette-surface"
          source={CustomVariantsShowcase()}
        />
      </DocSection>

      {/* ── API Reference ── */}
      <DocSection title="API Reference">
        <CssApiReference
          constructs={toggleCss}
          cssVars={[
            {
              name: "--toggle-h",
              description: "Height of the toggle track.",
            },
            {
              name: "--toggle-p",
              description:
                "Inner padding between the track edge and the thumb.",
            },
          ]}
          slots={[
            {
              name: ".toggle-thumb",
              description:
                "Optional child element. When present, replaces the default ::before pseudo-element as the movable thumb — allowing icons or custom content inside it.",
            },
          ]}
          variants={[
            {
              name: "toggle-on",
              description:
                "Applies when the toggle is on (checkbox checked, aria-checked='true', or .toggle-active class present).",
            },
            {
              name: "toggle-off",
              description:
                "Applies when the toggle is off (none of the above conditions are met).",
            },
          ]}
        />
      </DocSection>
    </DocPage>
  );
}
