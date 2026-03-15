import { DocPage, DocSection } from "@/app/_ui/doc/DocPage";
import { ButtonPlayground } from "./_components/button-playground";
import { StaticExample } from "@/app/_ui/example/static-example";
import { UtilityReference, UtilityValue } from "@/ui/doc/utility-reference.tsx";
import VariantsExample from "./_examples/variants.example.tsx";
import SolidExample from "./_examples/palette-solid.example.tsx";
import SoftExample from "./_examples/palette-soft.example.tsx";
import OutlineExample from "./_examples/palette-outline.example.tsx";
import GhostExample from "./_examples/palette-ghost.example.tsx";
import SizesExample from "./_examples/sizes.example.tsx";
import IconExample from "./_examples/icon-buttons.example.tsx";
import BtnGroupExample from "./_examples/btn-group.example.tsx";
import { SpotlightContainer } from "@/ui/doc/spotlight-container.tsx";

export default async function ButtonPage() {
  return (
    <DocPage
      title="Button"
      description="Composable button utilities: pick a variant, a tone, and a size. Everything else (hover, focus, active) is built in."
    >
      {/* ── At a glance ── */}
      <DocSection title="At a glance">
        <SpotlightContainer>
          <div className="flex flex-wrap gap-2">
            <button className="btn-solid/primary">Solid</button>
            <button className="btn-soft/secondary">Soft</button>
            <button className="btn-outline/accent">Outline</button>
            <button className="btn-ghost/surface">Ghost</button>
            <button className="btn-soft/surface btn-size-sm">Small</button>
          </div>
        </SpotlightContainer>
      </DocSection>

      {/* ── Playground ── */}
      <DocSection title="Playground">
        <ButtonPlayground />
      </DocSection>

      {/* ── btn ── */}
      <DocSection title="btn-{variant}/{tone}">
        <UtilityReference
          tags={["component", "composable"]}
          description="Applies button styling using the selected variant and tone palette."
          table={[
            {
              label: "Pattern",
              content: <span>btn-{"{variant}/{tone}"}</span>,
            },
            {
              label: "Variant",
              content: (
                <UtilityValue values={["solid", "soft", "outline", "ghost"]} />
              ),
            },
            {
              label: "Palette",
              content: (
                <UtilityValue
                  values={["primary", "secondary", "accent", "surface"]}
                />
              ),
            },
            {
              label: "Composes with",
              content: (
                <>
                  <UtilityValue
                    values={["btn-size-{size}", "btn-icon"]}
                    divider="+"
                  />
                </>
              ),
            },
          ]}
        />

        <SpotlightContainer title="Solid">
          <div className="flex gap-3">
            <button className="btn-solid/primary">Button</button>
            <button className="btn-solid/secondary">Button</button>
            <button className="btn-solid/accent">Button</button>
            <button className="btn-solid/surface">Button</button>
          </div>
        </SpotlightContainer>

        <SpotlightContainer title="Soft">
          <div className="flex gap-3">
            <button className="btn-soft/primary">Button</button>
            <button className="btn-soft/secondary">Button</button>
            <button className="btn-soft/accent">Button</button>
            <button className="btn-soft/surface">Button</button>
          </div>
        </SpotlightContainer>

        <SpotlightContainer title="Outline">
          <div className="flex gap-3">
            <button className="btn-outline/primary">Button</button>
            <button className="btn-outline/secondary">Button</button>
            <button className="btn-outline/accent">Button</button>
            <button className="btn-outline/surface">Button</button>
          </div>
        </SpotlightContainer>

        <SpotlightContainer title="ghost">
          <div className="flex gap-3">
            <button className="btn-ghost/primary">Button</button>
            <button className="btn-ghost/secondary">Button</button>
            <button className="btn-ghost/accent">Button</button>
            <button className="btn-ghost/surface">Button</button>
          </div>
        </SpotlightContainer>
      </DocSection>

      {/* ── btn-group ── */}
      <DocSection title="btn-group-{variant}/{tone}">
        <UtilityReference
          tags={["component", "composable"]}
          description="Groups adjacent buttons into a visually connected row sharing a variant style and tone palette."
          table={[
            {
              label: "Pattern",
              content: <span>btn-group-{"{variant}/{tone}"}</span>,
            },
            {
              label: "Variant",
              content: (
                <UtilityValue values={["solid", "soft", "outline", "ghost"]} />
              ),
            },
            {
              label: "Palette",
              content: (
                <UtilityValue
                  values={["primary", "secondary", "accent", "surface"]}
                />
              ),
            },
            {
              label: "Composes with",
              content: <span>btn-{"{variant}/{tone}"}</span>,
            },
          ]}
        />
        <StaticExample.FromShowcaseJsx source={BtnGroupExample} />
      </DocSection>

      {/* ── btn-size ── */}
      <DocSection title="btn-size-{size}">
        <UtilityReference
          tags={["modifier"]}
          description="Controls the padding and font size of a button. Composes with any btn variant."
          table={[
            {
              label: "Pattern",
              content: <span>btn-size-{"{size}"}</span>,
            },
            {
              label: "Size",
              content: (
                <>
                  <span>sm</span>
                  <span>md</span>
                  <span>lg</span>
                </>
              ),
            },
            {
              label: "Default",
              content: <span>btn-size-md</span>,
            },
            {
              label: "Composes with",
              content: <span>btn-{"{variant}/{tone}"}</span>,
            },
          ]}
        />
        <StaticExample.FromShowcaseJsx source={SizesExample} />
      </DocSection>

      {/* ── btn-icon ── */}
      <DocSection title="btn-icon">
        <UtilityReference
          tags={["modifier"]}
          description="Makes a square, fully-rounded icon button by equalizing inline and block padding."
          table={[
            {
              label: "Pattern",
              content: <span>btn-icon</span>,
            },
            {
              label: "Composes with",
              content: (
                <>
                  <span>btn-{"{variant}/{tone}"}</span>
                  <span>btn-size-{"{size}"}</span>
                </>
              ),
            },
          ]}
        />
        <StaticExample.FromShowcaseJsx source={IconExample} />
      </DocSection>
    </DocPage>
  );
}
