import { DocPage } from "@/ui/doc/DocPage";
import { DocSection } from "@/ui/doc/DocPage.client";
import { Spotlight } from "@/ui/doc/spotlight";
import { ArrowRightIcon } from "@/ui/icons";
import { Overline } from "@/ui/layout/overline";
import { type ReactNode } from "react";

const installCommand = `pnpm add @nataliebasille/natcore-design-system tailwindcss`;

const stylesheetImport = `@import "tailwindcss";
@import "@nataliebasille/natcore-design-system";`;

const themeExample = `<html data-theme="citrine-reef">
  <body>
    <button class="button button-solid/primary">Create project</button>
  </body>
</html>`;

const productionCheck = `pnpm build`;

const steps = [
  {
    title: "Install the package",
    eyebrow: "Package",
    body: "Add Natcore and Tailwind to the app that owns your global stylesheet.",
    code: installCommand,
    language: "bash",
  },
  {
    title: "Import the CSS",
    eyebrow: "Stylesheet",
    body: "Load Tailwind first, then Natcore. The design system registers tokens, component classes, modifiers, and theme-ready color palettes.",
    code: stylesheetImport,
    language: "css",
  },
  {
    title: "Apply classes in markup",
    eyebrow: "Usage",
    body: "Compose components and modifiers directly on the element. Theme changes can happen above the UI with a data attribute.",
    code: themeExample,
    language: "html",
  },
  {
    title: "Build once",
    eyebrow: "Verify",
    body: "Run a production build after the first import so Tailwind can scan your project and emit the classes you use.",
    code: productionCheck,
    language: "bash",
  },
] as const;

const supportedSurfaces = [
  "Next.js app router",
  "React client apps",
  "Static HTML",
  "Any UI that renders class names",
];

export default function InstallationPage() {
  return (
    <DocPage
      title="Installation"
      description="Set up Natcore once, then style UI through portable class names, tokens, and themes."
    >
      <DocSection title="Quick start">
        <Spotlight className="overflow-hidden p-0">
          <div className="grid gap-0 desktop:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="p-5 tablet:p-6">
              <Overline className="mb-3 text-on-50/60">Install flow</Overline>
              <p className="max-w-2xl text-sm/7 text-on-50/75">
                Natcore v2 is CSS-first. The only hard requirement is that your
                app can import a global stylesheet and render HTML class names.
                From there, components, modifiers, and themes all travel through
                markup.
              </p>
            </div>
            <div className="border-t border-on-50/10 bg-on-50/5 p-5 tablet:p-6 desktop:border-t-0 desktop:border-l">
              <div className="text-sm font-semibold tracking-tight">
                Works well with
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {supportedSurfaces.map((surface) => (
                  <span
                    key={surface}
                    className="badge-soft/surface rounded-md px-2 py-1 text-xs"
                  >
                    {surface}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Spotlight>
      </DocSection>

      <DocSection
        title="Installation steps"
        description="Move top to bottom. Each step builds on the one before it, so the page reads like a setup checklist instead of four loose snippets."
      >
        <div className="relative mt-3">
          <div className="space-y-5">
            {steps.map((step, index) => (
              <InstallStep
                key={step.title}
                number={index + 1}
                isLast={index === steps.length - 1}
                {...step}
              />
            ))}
          </div>
        </div>
      </DocSection>

      <DocSection title="After install">
        <div className="grid gap-3 tablet:grid-cols-3">
          <InfoPanel
            title="Use components"
            description="Start with classes like button, card, badge, divider, list, toggle, and tray."
          />
          <InfoPanel
            title="Compose modifiers"
            description="Pair component classes with palette and state modifiers to keep markup readable."
          />
          <InfoPanel
            title="Switch themes"
            description="Set a supported data-theme on the root element and the same HTML follows the new palette."
          />
        </div>
      </DocSection>
    </DocPage>
  );
}

function InstallStep({
  number,
  eyebrow,
  title,
  body,
  code,
  language,
  isLast,
}: {
  number: number;
  eyebrow: string;
  title: string;
  body: string;
  code: string;
  language: "bash" | "css" | "html";
  isLast: boolean;
}) {
  return (
    <div className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4">
      <div className="divider-v divider-place-content-start">
        <div className="flex size-10 flex-[0_0_auto] items-center justify-center rounded-full border border-surface-600/40 bg-surface-50 text-sm font-semibold text-surface-950 shadow-sm">
          {number}
        </div>
      </div>

      <div
        className={["card card-soft/surface", isLast ? "mb-0" : "mb-1"].join(
          " ",
        )}
      >
        <div data-slot="content" className="gap-4">
          <div className="flex flex-col gap-2 tablet:flex-row tablet:items-start tablet:justify-between">
            <div>
              <Overline className="mb-2">{eyebrow}</Overline>
              <h3 className="m-0 text-xl tracking-tight">{title}</h3>
            </div>
            <span className="badge-soft/accent w-fit rounded-md px-2 py-1 text-xs">
              Step {number}
            </span>
          </div>

          <p className="max-w-2xl text-sm/7 text-surface-950/65">{body}</p>

          <InlineCodeBlock code={code} language={language} />
        </div>
      </div>
    </div>
  );
}

function InlineCodeBlock({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-on-50/10 bg-zinc-950 text-on-50">
      <div className="flex items-center justify-between border-b border-on-50/10 px-4 py-2 text-xs font-bold tracking-widest text-on-50/55 uppercase">
        Code
        <span className="text-accent-500">{language}</span>
      </div>
      <pre className="max-w-full overflow-x-auto p-4 text-sm/6 whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function InfoPanel({
  title,
  description,
}: {
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <div className="card card-outline/surface">
      <div data-slot="content" className="gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ArrowRightIcon className="size-4 text-accent-500" />
          {title}
        </div>
        <p className="text-xs/6 text-surface-950/65">{description}</p>
      </div>
    </div>
  );
}
