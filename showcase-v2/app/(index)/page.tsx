export default function Home() {
  return (
    <article>
      <header>
        <h1>Natcore Design System v2</h1>
        <p>
          Natcore v2 is a design system that is meant to survive different
          stacks. The core surface area is CSS: tokens, utilities, and component
          styles applied through class names. If your product renders HTML,
          Natcore can style it.
        </p>
        <p>
          Framework packages (React, Svelte, Vue) are optional. They exist for
          ergonomics, and they map to the same CSS contract. If something only
          works through a wrapper, that is a problem to fix, not a feature.
        </p>
      </header>

      <section aria-labelledby="requirements">
        <h2 id="requirements">Requirements</h2>
        <ul>
          <li>
            <p>
              <strong>Tailwind CSS is required.</strong>
            </p>
          </li>
          <li>
            <p>
              <strong>OKLCH support is required.</strong>
            </p>
          </li>
        </ul>
      </section>

      <section aria-labelledby="what-you-get">
        <h2 id="what-you-get">What Natcore provides</h2>
        <ul>
          <li>
            <p>
              <strong>Tokens</strong> as CSS variables for color, typography,
              spacing, radii, shadow, and motion. These tokens are the source of
              truth for visual decisions.
            </p>
          </li>
          <li>
            <p>
              <strong>Utilities</strong> that compose directly on markup and
              stay compatible with Tailwind conventions. You should be able to
              build most UI by composing utilities, not by writing custom CSS
              for every screen.
            </p>
          </li>
          <li>
            <p>
              <strong>Component styles</strong> implemented as reusable CSS
              patterns you opt into with classes. Modifiers are used to express
              intent consistently, rather than inventing one off class names.
            </p>
          </li>
          <li>
            <p>
              <strong>A plugin</strong> used to customize and add themes, and to
              keep configuration centralized.
            </p>
          </li>
          <li>
            <p>
              <strong>Framework packages and icons</strong> for React, Svelte,
              Vue, plus a separate icons package.
            </p>
          </li>
        </ul>
      </section>

      <section aria-labelledby="how-to-use">
        <h2 id="how-to-use">How you use Natcore</h2>
        <p>
          Import the core package from the same stylesheet where you import
          Tailwind. After that, usage is simple: write HTML, compose Tailwind
          utilities, and add Natcore utilities and component classes where you
          want Natcore behavior.
        </p>

        <pre>
          <code>@import "@nataliebasille/natcore-design-system-v2";</code>
        </pre>

        <p>
          Installation and configuration details, including plugin setup, are
          documented on the Installation page.
        </p>
      </section>

      <section aria-labelledby="theming">
        <h2 id="theming">Theming</h2>
        <p>
          Themes are selected via a <code>data-theme</code> attribute. Theme
          changes should not require markup changes. The point is that the same
          HTML can render correctly under different themes.
        </p>

        <pre>
          <code>&lt;html data-theme="dark"&gt; ... &lt;/html&gt;</code>
        </pre>

        <p>Tokens are exposed as CSS variables. Example:</p>

        <pre>
          <code>--color-primary</code>-500
        </pre>
      </section>

      <section aria-labelledby="conventions">
        <h2 id="conventions">Conventions</h2>
        <p>
          Natcore stays coherent by being strict about vocabulary and naming.
          You should be able to scan markup and understand intent without
          reading implementation code.
        </p>

        <p>
          Modifiers are the standard way to express variants and tones. Current
          vocabulary includes variants
          <code>solid</code>, <code>outline</code>, <code>ghost</code>,{" "}
          <code>soft</code>, <code>ghost-outline</code>
          and tones <code>primary</code>, <code>secondary</code>,{" "}
          <code>accent</code>, <code>surface</code>.
        </p>

        <pre>
          <code>
            &lt;div class="component component-variant/tone"&gt;...&lt;/div&gt;
          </code>
        </pre>

        <ul>
          <li>
            <p>
              Prefer tokens over raw values when a decision is meant to repeat.
            </p>
          </li>
          <li>
            <p>
              Prefer modifiers over creating new class names when expressing
              variants and tones.
            </p>
          </li>
          <li>
            <p>
              If you need the same workaround twice, the system is missing a
              token, a utility, or a modifier.
            </p>
          </li>
        </ul>
      </section>

      <footer>
        <p>
          Next: <a href="./installation">Installation</a>
        </p>
      </footer>
    </article>
  );
}
