import { Highlight } from "@/components/Highlight";
import { LogoSVG } from "@natcore/design-system-core";

export default function ButtonPage() {
  return (
    <article>
      <h1>Button</h1>

      <p className="mb-7 tracking-wider text-gray-600">
        A customizable button component that comes with different variants,
        sizes, and styles.
      </p>

      <h2>Usage</h2>

      <h3>Basic button</h3>

      <p className="tracking-wider text-gray-600">
        Button styles are applied using the{" "}
        <code
          className="text-primary inline-block bg-transparent p-0 font-bold"
          style={{ padding: "0 !important" }}
        >
          `.btn`
        </code>{" "}
        prefix.
      </p>
      <div className="border-primary-shades-500 rounded-lg border p-3">
        <Highlight
          component="code"
          content={`<button className="btn btn-primary">Primary</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-tertiary">Tertiary</button>
<button className="btn btn-accent">Accent</button>
<button className="btn btn-surface">Surface</button>
<button className="btn btn-ghost">Ghost</button>`}
          language="html"
        />
        <div className="divider mb-2">Output</div>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))",
          }}
        >
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-tertiary">Tertiary</button>
          <button className="btn btn-accent">Accent</button>
          <button className="btn btn-surface">Surface</button>
          <button className="btn btn-ghost">Ghost</button>
        </div>
      </div>
      <h3>Outlined button</h3>
      <p className="tracking-wider text-gray-600">
        A button with a transparent background with a visible border. Styles are
        applied using the{" "}
        <code
          className="text-primary inline-block bg-transparent p-0 font-bold"
          style={{ padding: "0 !important" }}
        >
          `.btn-outline`
        </code>{" "}
        class.
      </p>
      <div className="border-primary-shades-500 rounded-lg border p-3">
        <Highlight
          component="code"
          content={`<button className="btn btn-primary btn-outline">Primary</button>
<button className="btn btn-secondary btn-outline">Secondary</button>
<button className="btn btn-tertiary btn-outline">Tertiary</button>
<button className="btn btn-accent btn-outline">Accent</button>
<button className="btn btn-surface btn-outline">Surface</button>
<button className="btn btn-ghost btn-outline">Ghost</button>`}
          language="html"
        />
        <div className="divider mb-2">Output</div>
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))",
          }}
        >
          <button className="btn btn-primary btn-outline">Primary</button>
          <button className="btn btn-secondary btn-outline">Secondary</button>
          <button className="btn btn-tertiary btn-outline">Tertiary</button>
          <button className="btn btn-accent btn-outline">Accent</button>
          <button className="btn btn-surface btn-outline">Surface</button>
          <button className="btn btn-ghost btn-outline">Ghost</button>
        </div>
      </div>

      <h3>Sizes</h3>
      <p className="tracking-wider text-gray-600">
        Button sizes are applied using the{" "}
        <code
          className="text-primary inline-block bg-transparent p-0 font-bold"
          style={{ padding: "0 !important" }}
        >
          `.btn-sm`
        </code>{" "}
        (small) or{" "}
        <code
          className="text-primary inline-block bg-transparent p-0 font-bold"
          style={{ padding: "0 !important" }}
        >
          `.btn-lg`
        </code>{" "}
        (large) classes.
      </p>

      <div className="border-primary-shades-500 rounded-lg border p-3">
        <Highlight
          component="code"
          content={`<button className="btn btn-sm">Small</button>
<button className="btn">Standard</button>
<button className="btn btn-lg">Large</button>
<button className="btn btn-sm btn-outline">Small</button>
<button className="btn btn-outline">Standard</button>
<button className="btn btn-lg btn-outline">Large</button>`}
          language="html"
        />
        <div className="divider mb-2">Output</div>
        <div
          className="grid items-center justify-items-center gap-3"
          style={{
            gridTemplateColumns: "repeat(3, minmax(115px, 1fr))",
          }}
        >
          <button className="btn btn-sm">Small</button>
          <button className="btn">Standard</button>
          <button className="btn btn-lg">Large</button>
          <button className="btn btn-sm btn-outline">Small</button>
          <button className="btn btn-outline">Standard</button>
          <button className="btn btn-lg btn-outline">Large</button>
        </div>
      </div>

      <h3>Icon buttons</h3>
      <p className="tracking-wider text-gray-600">
        To create a icon friendly button, use the{" "}
        <code
          className="text-primary inline-block bg-transparent p-0 font-bold"
          style={{ padding: "0 !important" }}
        >
          `.btn-icon`
        </code>{" "}
        class.
      </p>

      <div className="border-primary-shades-500 rounded-lg border p-3">
        <Highlight
          component="code"
          content={`<button className="btn btn-icon btn-primary">{...icon}</button>
<button className="btn btn-icon btn-secondary">{...icon}</button>
<button className="btn btn-icon btn-tertiary">{...icon}</button>
<button className="btn btn-icon btn-accent">{...icon}</button>
<button className="btn btn-icon btn-ghost">{...icon}</button>
<button className="btn btn-icon btn-outline btn-primary">{...icon}</button>
<button className="btn btn-icon btn-outline btn-secondary">{...icon}</button>
<button className="btn btn-icon btn-outline btn-tertiary">{...icon}</button>
<button className="btn btn-icon btn-outline btn-accent">{...icon}</button>
<button className="btn btn-icon btn-outline btn-ghost">{...icon}</button>`}
          language="html"
        />
        <div className="divider mb-2">Output</div>

        <div
          className="grid items-center justify-items-center gap-3"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(115px, 1fr))",
          }}
        >
          <button className="btn btn-icon btn-primary">
            <LogoSVG />
          </button>
          <button className="btn btn-icon btn-secondary">
            <LogoSVG />
          </button>
          <button className="btn btn-icon btn-tertiary">
            <LogoSVG />
          </button>
          <button className="btn btn-icon btn-accent">
            <LogoSVG />
          </button>
          <button className="btn btn-icon btn-ghost">
            <LogoSVG />
          </button>
          <button className="btn btn-icon btn-outline btn-primary">
            <LogoSVG />
          </button>
          <button className="btn btn-icon btn-outline btn-secondary">
            <LogoSVG />
          </button>
          <button className="btn btn-icon btn-outline btn-tertiary">
            <LogoSVG />
          </button>
          <button className="btn btn-icon btn-outline btn-accent">
            <LogoSVG />
          </button>
          <button className="btn btn-icon btn-outline btn-ghost">
            <LogoSVG />
          </button>
        </div>
      </div>
    </article>
  );
}
