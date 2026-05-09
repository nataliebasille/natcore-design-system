import { DocPage } from "@/ui/doc/DocPage";
import { DocSection } from "@/ui/doc/DocPage.client";
import { ServerFormattedCodeSnippet } from "@/ui/code-snippet/server-formatted-code-snippet";
import { Spotlight } from "@/ui/doc/spotlight";
import { ArrowRightIcon } from "@/ui/icons";
import { Overline } from "@/ui/layout/overline";
import { type ReactNode } from "react";

const installCommands = [
  {
    label: "pnpm",
    code: `pnpm add @nataliebasille/natcore-design-system tailwindcss`,
  },
  {
    label: "yarn",
    code: `yarn add @nataliebasille/natcore-design-system tailwindcss`,
  },
  {
    label: "npm",
    code: `npm install @nataliebasille/natcore-design-system tailwindcss`,
  },
] as const;

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
    installCommands,
  } as const,
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
                Natcore is CSS-first. The only hard requirement is that your app
                can import a global stylesheet and render HTML class names. From
                there, components, modifiers, and themes all travel through
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
                {...(step as any)}
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

type InstallStepProps = {
  number: number;
  eyebrow: string;
  title: string;
  body: string;
} & (
  | { code: string; language: "bash" | "css" | "html"; installCommands?: never }
  | {
      installCommands: readonly { label: string; code: string }[];
      code?: never;
      language?: never;
    }
);

function InstallStep({
  number,
  eyebrow,
  title,
  body,
  ...rest
}: InstallStepProps) {
  const codeBlock =
    "installCommands" in rest && rest.installCommands ?
      <div className="flex flex-col gap-2">
        {rest.installCommands.map(({ label, code }) => (
          <div key={label}>
            <div className="mb-1 text-xs font-medium text-surface-950/50">
              {label}
            </div>
            <ServerFormattedCodeSnippet code={code} language="bash" />
          </div>
        ))}
      </div>
    : "code" in rest && rest.code ?
      <ServerFormattedCodeSnippet code={rest.code} language={rest.language!} />
    : null;
  return (
    <div className="relative grid grid-cols-1 gap-4 tablet:grid-cols-[2.5rem_minmax(0,1fr)] [&:last-child_.card]:mb-0 [&:not(:last-child)_.divider-v]:h-[calc(100%+var(--spacing)*5)]">
      <div className="mt-1 divider-v [--divider-gap:0] divider-place-content-start max-tablet:hidden">
        <div className="flex size-10 flex-[0_0_auto] items-center justify-center rounded-full border-2 border-accent-500 bg-accent-500/10 text-sm font-semibold text-accent-600">
          {number}
        </div>
      </div>

      <div className="card mb-1 card-soft/surface">
        <div data-slot="content" className="gap-4">
          <div>
            <Overline className="mb-2 flex items-center">
              <span>{eyebrow}</span>
              <span className="ml-auto badge-soft/accent rounded-md text-xs tablet:hidden">
                Step {number}
              </span>
            </Overline>
            <h3 className="m-0 text-xl tracking-tight">{title}</h3>
          </div>

          <p className="max-w-2xl text-sm/7 text-surface-950/65">{body}</p>

          {codeBlock}
        </div>
      </div>
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
