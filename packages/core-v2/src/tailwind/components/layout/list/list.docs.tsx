import { control, docsFor } from "@nataliebasille/css-engine";
import list from "./list.css.ts";

const { Page, Playground, Section, Example } = docsFor(list);

// Written out so Tailwind's source scan generates every playground class.
const LIST_CLASSES = {
  plain: {
    primary: "list/primary",
    secondary: "list/secondary",
    accent: "list/accent",
    surface: "list/surface",
    success: "list/success",
    danger: "list/danger",
    disabled: "list/disabled",
  },
  disc: {
    primary: "list-disc/primary",
    secondary: "list-disc/secondary",
    accent: "list-disc/accent",
    surface: "list-disc/surface",
    success: "list-disc/success",
    danger: "list-disc/danger",
    disabled: "list-disc/disabled",
  },
  decimal: {
    primary: "list-decimal/primary",
    secondary: "list-decimal/secondary",
    accent: "list-decimal/accent",
    surface: "list-decimal/surface",
    success: "list-decimal/success",
    danger: "list-decimal/danger",
    disabled: "list-decimal/disabled",
  },
} as const;

export default (
  <Page
    title="List"
    description='Structured lists with optional interactive rows, unordered markers, or decimal counters. Mark each child item with data-slot="item" so the list component can apply spacing, markers, and row states.'
    atAGlance={
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-4">
        <PlainList className="list/primary" />
        <DiscList className="list-disc/secondary" />
        <DecimalList className="list-decimal/accent" />
      </div>
    }
  >
    <Playground
      controls={{
        variant: false,
        style: control.select(["plain", "disc", "decimal"], {
          label: "Marker style",
          optionLabels: { plain: "Plain", disc: "Disc", decimal: "Decimal" },
        }),
        palette: control.palette(),
      }}
      render={(v) => {
        const className = LIST_CLASSES[v.style][v.palette];
        const items = (
          <>
            <li data-slot="item">Profile</li>
            <li data-slot="item" className="active">
              Security
            </li>
            <li data-slot="item">Notifications</li>
          </>
        );

        return (
          <ui-div className="border-surface-300/50 bg-surface-50 text-on-surface-50/80 w-full rounded-2xl border p-4 text-sm">
            {v.style === "decimal" ?
              <ol className={className}>{items}</ol>
            : <ul className={className}>{items}</ul>}
          </ui-div>
        );
      }}
    />

    <Section
      of="list"
      description="Applies base list reset, vertical spacing, and interactive item states. Use the optional palette modifier to tune hover and active colors."
    >
      <Example
        title="Interactive"
        description="Use the base list class for action lists, navigation rows, or selectable option groups."
      >
        <PlainList className="list/primary" />
      </Example>

      <Example
        title="Palettes"
        description="The palette modifier sets the hover and active row colors."
      >
        <ui-div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-4">
          <PlainList className="list/primary" />
          <PlainList className="list/accent" />
        </ui-div>
      </Example>
    </Section>

    <Section
      of="list@variant"
      title="Marker Style"
      description="Switches the list marker treatment. Use list-disc for unordered content and list-decimal for ordered steps."
    >
      <Example
        title="Disc"
        description="Use list-disc for unordered content where rows read as static list items."
      >
        <DiscList className="list-disc/secondary" />
      </Example>

      <Example
        title="Decimal"
        description="Use list-decimal for ordered sequences. The component generates the counters."
      >
        <DecimalList className="list-decimal/accent" />
      </Example>
    </Section>

    <Section
      of="@slots"
      title="Item Slot"
      description='Add data-slot="item" to each direct child so the list can style every row and marker.'
    >
      <Example title="Slot markup">
        <ul className="list/primary">
          <li data-slot="item">First item</li>
          <li data-slot="item">Second item</li>
          <li data-slot="item">Third item</li>
        </ul>
      </Example>
    </Section>
  </Page>
);

function PlainList({ className }: { className: string }) {
  return (
    <ul className={className}>
      <li data-slot="item">Profile</li>
      <li data-slot="item" className="active">
        Security
      </li>
      <li data-slot="item">Notifications</li>
    </ul>
  );
}

function DiscList({ className }: { className: string }) {
  return (
    <ul className={className}>
      <li data-slot="item">Design tokens</li>
      <li data-slot="item">Component builders</li>
      <li data-slot="item">Generated utilities</li>
    </ul>
  );
}

function DecimalList({ className }: { className: string }) {
  return (
    <ol className={className}>
      <li data-slot="item">Choose a component class</li>
      <li data-slot="item">Add data-slot="item" to each child</li>
      <li data-slot="item">Pick disc or decimal when needed</li>
    </ol>
  );
}
