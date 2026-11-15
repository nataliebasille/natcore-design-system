import { control, docsFor } from "@nataliebasille/css-engine";
import tabs from "./tabs.css.ts";

const { Page, Playground, Section, Example } = docsFor(tabs);

// Written out so Tailwind's source scan generates every playground class.
const TABS_CLASSES = {
  horizontal: {
    primary: "tabs/primary",
    secondary: "tabs/secondary",
    accent: "tabs/accent",
    surface: "tabs/surface",
  },
  vertical: {
    primary: "tabs-v/primary",
    secondary: "tabs-v/secondary",
    accent: "tabs-v/accent",
    surface: "tabs-v/surface",
  },
} as const;

const STYLE_CLASSES = {
  underline: "tabs-style-underline",
  pill: "tabs-style-pill",
  boxed: "tabs-style-boxed",
} as const;

const ITEMS = [
  {
    label: "Overview",
    panel: "A summary of the project: its goals, owners, and current status.",
  },
  {
    label: "Activity",
    panel: "Recent changes, comments, and reviews, newest first.",
  },
  {
    label: "Settings",
    panel: "Notifications, visibility, and who can edit the project.",
  },
];

// Click and keyboard handling for the aria-selected example, on the tabs
// element. Clicking selects a tab; the arrow keys, Home, and End move to
// another tab and select it. Only the selected tab is in the Tab order.
const SELECT_TAB =
  "const tab = event.target.closest('[role=tab]'); if (!tab || tab.parentElement.parentElement !== this) return; this.querySelectorAll(':scope > * > [role=tab]').forEach((t) => { t.setAttribute('aria-selected', t === tab); t.tabIndex = t === tab ? 0 : -1; });";
const MOVE_TAB =
  "const tabs = [...this.querySelectorAll(':scope > * > [role=tab]')]; const i = tabs.indexOf(event.target); const to = { ArrowLeft: i - 1, ArrowUp: i - 1, ArrowRight: i + 1, ArrowDown: i + 1, Home: 0, End: tabs.length - 1 }[event.key]; if (i < 0 || to === undefined) return; event.preventDefault(); const tab = tabs[(to + tabs.length) % tabs.length]; tab.focus(); tab.click();";

export default (
  <Page
    title="Tabs"
    description="Tabs that switch between panels. Use <details name> or radio buttons for tabs that work without JavaScript, or set aria-selected from your own script. Use tabs for a row of tabs above the panel or tabs-v for a column beside it, add a palette modifier such as tabs/primary, and add a tabs-style-* class to change the look."
    atAGlance={
      <ui-div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-6">
        <DetailsTabs className="tabs" name="glance-underline" />
        <DetailsTabs
          className="tabs/primary tabs-style-pill"
          name="glance-pill"
        />
      </ui-div>
    }
  >
    <Playground
      controls={{
        variant: false,
        style: control.select(["underline", "pill", "boxed"], {
          label: "Style",
        }),
        palette: control.palette(["primary", "secondary", "accent", "surface"]),
        markup: control.select(["details", "radio"], {
          label: "Markup",
          optionLabels: {
            details: "<details name>",
            radio: "Radio buttons",
          },
        }),
        vertical: control.boolean({
          label: "Layout",
          offLabel: "Horizontal (tabs)",
          onLabel: "Vertical (tabs-v)",
        }),
      }}
      render={(v) => {
        const className = [
          TABS_CLASSES[v.vertical ? "vertical" : "horizontal"][v.palette],
          STYLE_CLASSES[v.style],
        ].join(" ");

        return v.markup === "radio" ?
            <RadioTabs className={className} name="playground" />
          : <DetailsTabs className={className} name="playground" />;
      }}
    />

    <Section
      of="tabs"
      description="Puts the tabs in a row above the selected tab's panel and hides the other panels. Each direct child is one item with a tab and a panel. Every panel shares one area sized to the largest panel, so switching tabs never moves the tabs or the content below them. The row doesn't wrap and supports up to 50 tabs. On its own, tabs has the underline look; add a palette modifier, such as tabs/primary, to color the selected tab."
    >
      <Example
        title="Tabs"
        description="Clicking a tab shows its panel, and clicking the open tab does nothing. With the keyboard, Enter or Space on the open tab still closes it and leaves no panel showing; use radio buttons if a panel must always show."
      >
        <DetailsTabs className="tabs" name="basic" />
      </Example>

      <Example
        title="Palettes"
        description="The palette colors the selected tab's underline and focus ring."
      >
        <ui-div className="grid w-full grid-cols-[repeat(auto-fit,minmax(16rem,1fr))] gap-6">
          <DetailsTabs className="tabs/primary" name="palette-primary" />
          <DetailsTabs className="tabs/accent" name="palette-accent" />
        </ui-div>
      </Example>
    </Section>

    <Section
      title="Selecting a tab"
      description="A tab is selected by the markup around it, so pick the markup that fits how your page works. A <details> needs no attributes: its <summary> is the tab and the rest of its content is the panel. Any other item can be any element, with data-slot attributes marking its tab and panel."
    >
      <Example
        title="<details name>"
        description="No JavaScript and no data-slot attributes. The browser keeps only one <details> with the same name open, so opening one closes the others. The <summary> is the tab, and everything after it is the panel."
        table={[
          {
            label: "name",
            content: (
              <span>
                The same <code className="code-inline">name</code> on every{" "}
                <code className="code-inline">&lt;details&gt;</code> in one set
                of tabs, and a different one for each set.
              </span>
            ),
          },
          {
            label: "open",
            content: (
              <span>
                On the <code className="code-inline">&lt;details&gt;</code> that
                starts selected.
              </span>
            ),
          },
        ]}
      >
        <DetailsTabs className="tabs" name="markup-details" />
      </Example>

      <Example
        title="Radio buttons"
        description="No JavaScript. Each tab is a label around a radio, which is hidden but still focusable: Tab moves focus to the tabs, and the arrow keys switch between them. The radios also submit with a form."
        table={[
          {
            label: "name",
            content: (
              <span>
                The same <code className="code-inline">name</code> on every
                radio in one set of tabs.
              </span>
            ),
          },
          {
            label: "checked",
            content: <span>On the radio of the tab that starts selected.</span>,
          },
        ]}
      >
        <RadioTabs className="tabs" name="markup-radio" />
      </Example>

      <Example
        title="aria-selected"
        description="Your script decides which tab is selected. Use it when the selection comes from your app's state, such as the URL. Here, a small script on the tabs element selects a tab on click, and the arrow keys, Home, and End move between tabs."
        table={[
          {
            label: "aria-selected",
            content: (
              <span>
                <code className="code-inline">"true"</code> on the selected tab
                and <code className="code-inline">"false"</code> on the others.
                The panel next to the selected tab shows.
              </span>
            ),
          },
          {
            label: "tabindex",
            content: (
              <span>
                <code className="code-inline">0</code> on the selected tab and{" "}
                <code className="code-inline">-1</code> on the others, so Tab
                enters the tabs once and the arrow keys move between them. Keep
                it in step with{" "}
                <code className="code-inline">aria-selected</code>. Also{" "}
                <code className="code-inline">0</code> on each panel, so the
                next Tab reaches the open panel even when it holds only text;
                closed panels are hidden, so Tab skips them.
              </span>
            ),
          },
          {
            label: "role",
            content: (
              <span>
                <code className="code-inline">tab</code> on each tab and{" "}
                <code className="code-inline">tabpanel</code> on each panel, so
                screen readers announce them as tabs. A tab and its panel share
                an item, so the tabs have no parent of their own: put{" "}
                <code className="code-inline">tablist</code> on an empty element
                inside tabs, with <code className="code-inline">aria-owns</code>{" "}
                listing the tab ids. An empty item takes up no space.
              </span>
            ),
          },
        ]}
      >
        <ScriptTabs className="tabs" id="markup-aria" />
      </Example>
    </Section>

    <Section
      of="tabs@variant"
      title="Vertical tabs"
      description="tabs-v is tabs with the tabs in a column and the panel beside them. Use it in place of tabs; it works with every style, markup, and palette, and with responsive modifiers. Supports up to 50 tabs."
    >
      <Example title="Vertical">
        <ui-div className="grid w-full grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-6">
          <DetailsTabs className="tabs-v" name="vertical-underline" />
          <DetailsTabs
            className="tabs-v/primary tabs-style-boxed"
            name="vertical-boxed"
          />
        </ui-div>
      </Example>

      <Example
        title="Responsive"
        description="tabs min-[48rem]:tabs-v keeps the tabs in a row on narrow screens and moves them beside the panel from 48rem up."
      >
        <DetailsTabs
          className="tabs/primary tabs-style-pill min-[48rem]:tabs-v/primary"
          name="vertical-responsive"
        />
      </Example>
    </Section>

    <Section
      of="style@variant"
      title="Styles"
      description="A tabs-style-* class next to tabs or tabs-v changes how the tabs are drawn. The colors come from the palette on tabs or tabs-v, for example tabs/primary tabs-style-pill."
    >
      <Example
        title="Underline"
        description="A bar under the selected tab and a thin line under the row. This is what tabs looks like without a style."
      >
        <DetailsTabs
          className="tabs/primary tabs-style-underline"
          name="style-underline"
        />
      </Example>

      <Example title="Pill" description="The selected tab is a filled pill.">
        <DetailsTabs
          className="tabs/primary tabs-style-pill"
          name="style-pill"
        />
      </Example>

      <Example
        title="Boxed"
        description="Folder tabs: the selected tab joins a bordered, tinted panel."
      >
        <DetailsTabs
          className="tabs/primary tabs-style-boxed"
          name="style-boxed"
        />
      </Example>
    </Section>

    <Section
      of="@slots"
      title="Slots"
      description='data-slot="tab" marks a tab and data-slot="panel" the content it shows. Both sit directly inside an item: a direct child of tabs, such as an <li> or <div>. A <details> item needs neither: its <summary> is the tab and the rest of its content is the panel.'
    />
  </Page>
);

function DetailsTabs({ className, name }: { className: string; name: string }) {
  return (
    <div className={className}>
      {ITEMS.map((item, i) => (
        <details name={name} open={i === 0}>
          <summary>{item.label}</summary>
          <div>{item.panel}</div>
        </details>
      ))}
    </div>
  );
}

function RadioTabs({ className, name }: { className: string; name: string }) {
  return (
    <ul className={className}>
      {ITEMS.map((item, i) => (
        <li>
          <label data-slot="tab">
            <input
              type="radio"
              name={name}
              value={item.label.toLowerCase()}
              checked={i === 0}
            />
            {item.label}
          </label>
          <div data-slot="panel">{item.panel}</div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Inline event handlers can't be passed through server-rendered JSX, so the
 * preview injects the same HTML the snippet shows.
 */
function ScriptTabs({ className, id }: { className: string; id: string }) {
  const tabIds = ITEMS.map((_, i) => `${id}-tab-${i}`);
  const items = ITEMS.map(
    (item, i) => `  <div>
    <button type="button" role="tab" id="${tabIds[i]}" aria-controls="${id}-panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-slot="tab">${item.label}</button>
    <div role="tabpanel" id="${id}-panel-${i}" aria-labelledby="${tabIds[i]}" tabindex="0" data-slot="panel">${item.panel}</div>
  </div>`,
  );
  const html = `<div class="${className}" onclick="${SELECT_TAB}" onkeydown="${MOVE_TAB}">
  <div role="tablist" aria-label="Project" aria-owns="${tabIds.join(" ")}"></div>
${items.join("\n")}
</div>`;

  return (
    <>
      <ui-div className="contents" dangerouslySetInnerHTML={{ __html: html }} />
      <markup>{html}</markup>
    </>
  );
}
