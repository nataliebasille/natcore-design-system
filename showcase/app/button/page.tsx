import { Highlight } from "@/components/Highlight";

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
          <button className="btn btn-primary w-full">Primary</button>
          <button className="btn btn-secondary w-full">Secondary</button>
          <button className="btn btn-tertiary w-full">Tertiary</button>
          <button className="btn btn-accent w-full">Accent</button>
          <button className="btn btn-ghost w-full">Ghost</button>
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
        class
      </p>
      <div className="border-primary-shades-500 rounded-lg border p-3">
        <Highlight
          component="code"
          content={`<button className="btn btn-primary btn-outline">Primary</button>
<button className="btn btn-secondary btn-outline">Secondary</button>
<button className="btn btn-tertiary btn-outline">Tertiary</button>
<button className="btn btn-accent btn-outline">Accent</button>
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
          <button className="btn btn-primary btn-outline w-full">
            Primary
          </button>
          <button className="btn btn-secondary btn-outline w-full">
            Secondary
          </button>
          <button className="btn btn-tertiary btn-outline w-full">
            Tertiary
          </button>
          <button className="btn btn-accent btn-outline w-full">Accent</button>
          <button className="btn btn-ghost btn-outline w-full">Ghost</button>
        </div>
      </div>

      <h3>Sizes</h3>
      {/* <SelectorContainer>
        <SelectorContent selector="Preview">
          <Preview />
        </SelectorContent>
        <SelectorContent selector="Classes">
          <p>classes</p>
        </SelectorContent>
      </SelectorContainer>

      <h2>Frameworks</h2>

      <SelectorContainer>
        <SelectorContent selector="React">
          <p>react</p>
        </SelectorContent>
      </SelectorContainer> */}
    </article>
  );
}
