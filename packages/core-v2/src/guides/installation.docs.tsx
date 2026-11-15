import { docs } from "@nataliebasille/css-engine";
import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";

const { Page, Section } = docs();

const STYLESHEET_IMPORT = `@import "tailwindcss";
@import "@nataliebasille/natcore-design-system";`;

const THEME_EXAMPLE = `<html data-theme="citrine-reef">
  <body>
    <button class="btn-solid/primary">Create project</button>
  </body>
</html>`;

export default (
  <Page
    title="Installation"
    description="Install Natcore, import the stylesheet, and start using component classes in your markup."
    nav={{ group: "Getting Started", order: 1, path: "/installation" }}
  >
    <Section title="Quick start">
      <div className="grid w-full gap-6">
        <Step
          number={1}
          title="Install package"
          description="Add Natcore and Tailwind to the app that owns your global stylesheet."
        >
          <Command label="pnpm">
            pnpm add @nataliebasille/natcore-design-system tailwindcss
          </Command>
          <Command label="npm">
            npm install @nataliebasille/natcore-design-system tailwindcss
          </Command>
          <Command label="yarn">
            yarn add @nataliebasille/natcore-design-system tailwindcss
          </Command>
        </Step>

        <Step
          number={2}
          title="Import stylesheet"
          description="Load Tailwind first, then Natcore. The import registers tokens, component classes, modifiers, and color palettes."
        >
          <code>{STYLESHEET_IMPORT}</code>
        </Step>

        <Step
          number={3}
          title="Use classes"
          description="Natcore is CSS-first, so the same classes work in React, server-rendered templates, or plain HTML."
        >
          <code>{THEME_EXAMPLE}</code>
        </Step>

        <Step
          number={4}
          title="Verify setup"
          description="Run a production build once after the import is in place so Tailwind can emit the classes used by your app."
        >
          <code>pnpm build</code>
        </Step>
      </div>
    </Section>

    <Section title="Next steps">
      <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-3">
        <a href="/components/button" className="card-hover card-soft/surface">
          <InfoPanel
            title="Components →"
            description="Browse the component docs for live examples, copyable markup, and the full class reference."
          />
        </a>
        <div className="card-soft/surface">
          <InfoPanel
            title="Modifiers"
            description="Pair component classes with palette and state modifiers to keep markup readable."
          />
        </div>
        <div className="card-soft/surface">
          <InfoPanel
            title="Themes"
            description="Set data-theme on the root element and the same HTML follows the new palette."
          />
        </div>
      </div>
    </Section>
  </Page>
);

function Step({
  number,
  title,
  description,
  children,
}: {
  number: number;
  title: string;
  description: string;
  children?: ShowcaseJsxNode | ShowcaseJsxNode[];
}) {
  return (
    <section>
      <div className="mb-3 flex items-start gap-3">
        <span className="border-surface-600/25 bg-surface-50 text-on-surface-50 flex size-9 flex-[0_0_auto] items-center justify-center rounded-md border text-sm font-semibold">
          {number}
        </span>
        <div>
          <div className="mb-1 text-2xl tracking-tight">{title}</div>
          <p className="text-surface-950/65 text-sm/7">{description}</p>
        </div>
      </div>

      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Command({ label, children }: { label: string; children: string }) {
  return (
    <div>
      <div className="text-surface-950/50 mb-1 text-xs font-medium tracking-wider uppercase">
        {label}
      </div>
      <code>{children}</code>
    </div>
  );
}

function InfoPanel({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div data-slot="content" className="gap-2">
      <div className="text-sm font-semibold">{title}</div>
      <p className="text-surface-950/65 text-xs/6">{description}</p>
    </div>
  );
}
