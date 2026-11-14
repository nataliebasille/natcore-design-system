import { control, docsFor } from "@nataliebasille/css-engine";
import { uiAttr } from "@nataliebasille/preview-jsx-runtime/jsx-runtime";
import type { CSSProperties } from "react";
import progress from "./progress.css.ts";

const { Page, Playground, Section, Example } = docsFor(progress);

// Written out so Tailwind's source scan generates every playground class.
const PALETTE_CLASSES = {
  primary: "progress-radial/primary",
  secondary: "progress-radial/secondary",
  accent: "progress-radial/accent",
  surface: "progress-radial/surface",
  success: "progress-radial/success",
  danger: "progress-radial/danger",
  disabled: "progress-radial/disabled",
} as const;

const THICKNESS_CLASSES = {
  "10": "progress-thickness-10",
  "50": "progress-thickness-50",
  "100": "progress-thickness-100",
} as const;

export default (
  <Page
    title="Progress"
    description="A radial progress ring. Set the value with a CSS variable or a utility, pick a palette and a size, and value changes animate. The ring doesn't style its content, so labels are plain Tailwind."
    atAGlance={
      <div className="flex flex-wrap items-center gap-4">
        <div className="progress-radial/primary progress-value-25 progress-size-4xl"></div>
        <div className="progress-radial/secondary progress-value-50 progress-size-5xl"></div>
        <div className="progress-radial/success progress-value-75 progress-size-6xl"></div>
        <div className="inline-grid place-items-center">
          <div className="progress-radial/accent progress-value-60 progress-size-7xl col-start-1 row-start-1"></div>
          <span className="col-start-1 row-start-1 text-sm font-semibold">
            60%
          </span>
        </div>
      </div>
    }
  >
    <Playground
      controls={{
        variant: false,
        size: { default: "5xl" },
        palette: control.palette(),
        value: control.select(["unset", "0", "25", "50", "75", "100"], {
          default: "50",
          label: "Value",
          optionLabels: {
            unset: "Not set",
            "0": "0%",
            "25": "25%",
            "50": "50%",
            "75": "75%",
            "100": "100%",
          },
          custom: control.number({ default: 50, min: 0, max: 100, step: 1 }),
        }),
        thickness: control.select(["10", "default", "50", "100"], {
          default: "default",
          label: "Thickness",
          optionLabels: {
            default: "Default (25%)",
            "10": "10%",
            "50": "50%",
            "100": "100%",
          },
          custom: control.number({ default: 25, min: 1, max: 100, step: 1 }),
        }),
      }}
      render={(v) => {
        const value = v.value === "unset" ? undefined : Number(v.value);
        // Custom numbers go inline: a class built from any number wouldn't be generated.
        const thickness =
          typeof v.thickness === "number" ? v.thickness : undefined;
        const className = [
          PALETTE_CLASSES[v.palette],
          `progress-size-${v.size}`,
          typeof v.thickness === "string" && v.thickness !== "default" ?
            THICKNESS_CLASSES[v.thickness]
          : undefined,
        ]
          .filter(Boolean)
          .join(" ");
        const style = {
          ...(value !== undefined && { "--progress-value": `${value}%` }),
          ...(thickness !== undefined && {
            "--progress-thickness": `${thickness}%`,
          }),
        } as CSSProperties;

        return (
          <div
            className={className}
            role="progressbar"
            aria-label="Progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            style={Object.keys(style).length > 0 ? style : undefined}
          ></div>
        );
      }}
    />

    <Section
      of="progress"
      title="Radial"
      description="A ring whose first --progress-value of the circle, clockwise from the top, is filled with the palette's 500 shade over a 200 shade track. Add a palette modifier to pick the colors; without one, the ring uses the palette it inherits."
    >
      <Example title="Palettes">
        <ui-div className="flex w-full flex-wrap items-center gap-4">
          <div className="progress-radial/primary progress-value-60 progress-size-5xl"></div>
          <div className="progress-radial/secondary progress-value-60 progress-size-5xl"></div>
          <div className="progress-radial/accent progress-value-60 progress-size-5xl"></div>
          <div className="progress-radial/surface progress-value-60 progress-size-5xl"></div>
          <div className="progress-radial/success progress-value-60 progress-size-5xl"></div>
          <div className="progress-radial/danger progress-value-60 progress-size-5xl"></div>
          <div className="progress-radial/disabled progress-value-60 progress-size-5xl"></div>
        </ui-div>
      </Example>

      <Example
        title="Inherited palette"
        description="Without a modifier, progress-radial uses the palette set by an ancestor, like palette-danger."
      >
        <div className="palette-danger">
          <div className="progress-radial progress-value-80 progress-size-5xl"></div>
        </div>
      </Example>
    </Section>

    <Section
      of="size"
      title="Sizes"
      description="Sets the ring's diameter. By default the ring is 1/8 of the diameter thick, so it scales with the size."
    >
      <Example
        title="Preset sizes"
        description="xs through 9xl match Tailwind's default text sizes, from 12px to 128px. base (16px) is the default."
      >
        <ui-div className="flex w-full flex-wrap items-center gap-4">
          <div className="progress-radial/primary progress-value-70 progress-size-xs"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-sm"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-base"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-lg"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-xl"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-2xl"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-3xl"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-4xl"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-5xl"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-6xl"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-7xl"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-8xl"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-9xl"></div>
        </ui-div>
      </Example>

      <Example
        title="Next to text"
        description="Give the ring the same size as the text beside it."
      >
        <p className="flex items-center gap-2 text-lg">
          <span className="progress-radial/primary progress-value-40 progress-size-lg"></span>
          Uploading…
        </p>
      </Example>

      <Example
        title="Arbitrary size"
        description="Pass any CSS length in square brackets, like progress-size-[2rem] or progress-size-[120px]."
      >
        <ui-div className="flex w-full flex-wrap items-center gap-4">
          <div className="progress-radial/primary progress-value-70 progress-size-[2rem]"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-[120px]"></div>
        </ui-div>
      </Example>
    </Section>

    <Section
      of="thickness"
      title="Thickness"
      description="Sets --progress-thickness, how thick the ring is. A bare integer is a percentage of the radius; square brackets take any length or percentage. The default, 25%, is 1/8 of the diameter."
    >
      <Example
        title="Length"
        description="A length keeps the ring the same thickness at any size."
      >
        <ui-div className="flex w-full flex-wrap items-center gap-4">
          <div className="progress-radial/primary progress-value-70 progress-size-7xl progress-thickness-[2px]"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-7xl progress-thickness-[6px]"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-7xl progress-thickness-[0.75rem]"></div>
        </ui-div>
      </Example>

      <Example
        title="Percentage"
        description="A percentage is how far the ring reaches toward the center, so it scales with the size. 100 fills the circle."
      >
        <ui-div className="flex w-full flex-wrap items-center gap-4">
          <div className="progress-radial/primary progress-value-70 progress-size-7xl progress-thickness-10"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-7xl progress-thickness-50"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-7xl progress-thickness-[62.5%]"></div>
          <div className="progress-radial/primary progress-value-70 progress-size-7xl progress-thickness-100"></div>
        </ui-div>
      </Example>
    </Section>

    <Section
      of="value-*"
      title="Value"
      description="Sets --progress-value, the filled part of the ring. A bare integer is a percentage; square brackets take any percentage. The variable only accepts percentages, so anything else falls back to 0%, and a ring never inherits its parent's value."
    >
      <Example
        title="Utility"
        description="Use the utility for values known when you write the markup."
      >
        <ui-div className="flex w-full flex-wrap items-center gap-4">
          <div className="progress-radial/primary progress-value-0 progress-size-5xl"></div>
          <div className="progress-radial/primary progress-value-25 progress-size-5xl"></div>
          <div className="progress-radial/primary progress-value-50 progress-size-5xl"></div>
          <div className="progress-radial/primary progress-value-[62.5%] progress-size-5xl"></div>
          <div className="progress-radial/primary progress-value-100 progress-size-5xl"></div>
        </ui-div>
      </Example>

      <Example
        title="CSS variable"
        description="For values that change at runtime, set --progress-value inline. Tailwind only generates classes it finds in your source, so a utility built from a runtime number won't exist."
      >
        <div
          className="progress-radial/primary progress-size-5xl"
          style={valueStyle("37%")}
        ></div>
      </Example>

      <Example
        title="Animated changes"
        description="Changing the value animates over 500ms, except when the user prefers reduced motion."
      >
        <ui-div className="flex w-full flex-wrap items-center gap-4">
          <div
            {...uiAttr({ id: "progress-animated" })}
            className="progress-radial/success progress-size-7xl"
            role="progressbar"
            aria-label="Upload"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={20}
            style={valueStyle("20%")}
          ></div>
          <PreviewButtons html={valueButtons("progress-animated")} />
        </ui-div>
      </Example>
    </Section>

    <Section
      title="Loading indicator"
      description="For a wait with no known progress, fill part of the ring and spin it with Tailwind's animate-spin. motion-safe: keeps it still for users who prefer reduced motion. Leave out aria-valuenow so assistive technology reports the progress as indeterminate."
    >
      <Example>
        <ui-div className="flex w-full flex-wrap items-center gap-4">
          <div
            className="progress-radial/primary progress-value-25 progress-size-5xl motion-safe:animate-spin"
            role="progressbar"
            aria-label="Loading"
          ></div>
          <p className="flex items-center gap-2">
            <span
              className="progress-radial/secondary progress-value-25 progress-size-base motion-safe:animate-spin"
              role="progressbar"
              aria-label="Saving"
            ></span>
            Saving…
          </p>
        </ui-div>
      </Example>
    </Section>

    <Section
      title="Labels"
      description="The ring doesn't style its content, and its mask would hide anything inside it. To show a label, stack it over the ring with Tailwind's grid utilities."
    >
      <Example>
        <div className="inline-grid place-items-center">
          <div
            className="progress-radial/primary progress-size-7xl col-start-1 row-start-1"
            style={valueStyle("72%")}
          ></div>
          <span className="col-start-1 row-start-1 text-lg font-semibold">
            72%
          </span>
        </div>
      </Example>
    </Section>

    <Section
      title="Accessibility"
      description="The ring is purely visual. Give it role progressbar, an accessible name, and aria-valuemin, aria-valuemax, and aria-valuenow, and update aria-valuenow whenever you change --progress-value."
    >
      <Example>
        <div
          className="progress-radial/primary progress-size-5xl"
          role="progressbar"
          aria-label="Profile completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={45}
          style={valueStyle("45%")}
        ></div>
      </Example>
    </Section>
  </Page>
);

/** An inline style setting --progress-value, which React's types don't know. */
function valueStyle(value: string) {
  return { "--progress-value": value } as CSSProperties;
}

/** Buttons that set a ring's value (and aria-valuenow) from script. */
function valueButtons(id: string) {
  return [0, 25, 50, 75, 100]
    .map(
      (value) =>
        `<button class="btn-soft/surface btn-size-sm" onclick="const ring = document.getElementById('${id}'); ring.style.setProperty('--progress-value', '${value}%'); ring.setAttribute('aria-valuenow', '${value}')">${value}%</button>`,
    )
    .join("\n");
}

/** Script-driven demo buttons, shown in the preview but left out of the snippet. */
function PreviewButtons({ html }: { html: string }) {
  return (
    <ui-div
      className="flex flex-wrap gap-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
