/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

export default {
  title: 'Article',
  description:
    'Long-form text spacing for paragraphs, list items, and headings. Bare <article> elements get it automatically, and the article class applies it to any element. Tailwind utilities on the children override it without !.',
  atAGlance: (
    <article className="w-full">
      <h2>Release notes</h2>
      <p>Typography is now overridable with plain Tailwind utilities.</p>
      <h3>What changed</h3>
      <p>Article and heading styles moved into the components layer.</p>
    </article>
  ),
  components: {
    article: {
      name: 'Article',
      description:
        'Spaces and colors the content inside it. <article> elements get the article class automatically.',
      showcases: [
        {
          title: 'A typical article',
          content: typicalShowcase(),
          table: [
            { label: 'p', content: '1rem (4) margin above and below; relaxed line height.' },
            {
              label: 'h1, h2, h3',
              content: '2rem (8) margin above, 1rem (4) below.',
            },
            { label: 'h1 – h6', content: 'Text color from the current tone.' },
            { label: '.list-item', content: 'Relaxed line height.' },
            { label: 'First child', content: 'No top margin.' },
          ],
        },
      ],
    },
  },
  sections: [
    {
      title: 'On any element',
      description:
        'To apply article styles to content that shouldn’t be an <article> element, such as a post body inside a card or a div rendered by a CMS, add the article class to its container.',
      showcases: [
        {
          title: 'The article class on a div',
          content: anyElementShowcase(),
        },
      ],
    },
    {
      title: 'Overriding with Tailwind',
      description:
        'Article styles sit in the components layer, so Tailwind utilities on its children win without the ! important modifier.',
      showcases: [
        {
          title: 'Utilities on article content',
          content: overridesShowcase(),
          table: [
            { label: 'm-0 on a <p>', content: 'Removes the paragraph spacing.' },
            { label: 'mt-2 on an <h2>', content: 'Replaces the 2rem space above the heading.' },
            { label: 'leading-tight on a <p>', content: 'Replaces the relaxed line height.' },
            { label: 'text-* on a heading', content: 'Replaces the tone text color.' },
          ],
        },
      ],
    },
  ],
} satisfies Documentation<
  typeof import('../../../../../packages/core-v2/src/tailwind/typography/article/article.css.ts').default
>

function typicalShowcase() {
  return (
    <article className="w-full">
      <h2>Getting started</h2>
      <p>
        Install the package, import the stylesheet, and start using the classes. Paragraphs are
        spaced and use a relaxed line height for comfortable reading.
      </p>
      <h3>Next steps</h3>
      <p>Headings get extra space above them to separate sections.</p>
      <ul>
        <li className="list-item">List items use the same relaxed line height.</li>
        <li className="list-item">The first child never adds space at the top.</li>
      </ul>
    </article>
  )
}

function anyElementShowcase() {
  return (
    <div className="article w-full">
      <h3>Post title</h3>
      <p>The article class gives any element the same spacing as an article element.</p>
      <p>Use it when the semantic element would be wrong.</p>
    </div>
  )
}

function overridesShowcase() {
  return (
    <article className="w-full">
      <h2>Compact section</h2>
      <p className="m-0">This paragraph uses m-0, so it sits right under the heading.</p>
      <h2 className="mt-2 text-primary-600">Close heading</h2>
      <p className="leading-tight">
        This paragraph uses leading-tight, so its lines sit closer together than the relaxed default
        used in the rest of the article.
      </p>
    </article>
  )
}
