/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

export default {
  title: 'Heading',
  description:
    'Type scale for headings. Bare <h1>–<h6> elements are sized automatically, and heading-1 … heading-6 apply the same sizes to any element. Tailwind text, leading, tracking, and spacing utilities override them without !.',
  atAGlance: (
    <ui-div className="flex w-full flex-col gap-2 *:m-0">
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
    </ui-div>
  ),
  components: {
    heading: {
      name: 'Heading',
      description:
        'Sets the font size for a level (1 is largest, 6 smallest) with wide tracking and tight leading. <h1>–<h6> get the matching level automatically.',
      showcases: [
        {
          title: 'All levels',
          description: 'Bare heading elements, no classes needed.',
          content: levelsShowcase(),
          table: [
            { label: 'h1 / heading-1', content: 'text-5xl (3rem)' },
            { label: 'h2 / heading-2', content: 'text-3xl (1.875rem)' },
            { label: 'h3 / heading-3', content: 'text-xl (1.25rem)' },
            { label: 'h4 / heading-4', content: 'text-lg (1.125rem)' },
            { label: 'h5 / heading-5', content: 'text-base (1rem)' },
            { label: 'h6 / heading-6', content: 'text-sm (0.875rem)' },
          ],
        },
      ],
    },
  },
  sections: [
    {
      title: 'On any element',
      description:
        'Use heading-* when text should look like a heading without changing the document outline, or when a heading element needs a different visual level.',
      showcases: [
        {
          title: 'Heading sizes on other elements',
          content: anyElementShowcase(),
        },
      ],
    },
    {
      title: 'Overriding with Tailwind',
      description:
        'Heading styles sit in the components layer, so Tailwind utilities on the element win without the ! important modifier.',
      showcases: [
        {
          title: 'Utilities on headings',
          content: overridesShowcase(),
          table: [
            { label: 'text-*', content: 'Replaces the font size.' },
            { label: 'leading-*', content: 'Replaces the tight line height.' },
            { label: 'tracking-*', content: 'Replaces the wide letter spacing.' },
            { label: 'm-*, p-*, …', content: 'Spacing utilities apply as usual.' },
          ],
        },
      ],
    },
  ],
} satisfies Documentation<
  typeof import('../../../../../packages/core-v2/src/tailwind/typography/heading/heading.css.ts').default
>

function levelsShowcase() {
  return (
    <ui-div className="flex w-full flex-col gap-2 *:m-0">
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
    </ui-div>
  )
}

function anyElementShowcase() {
  return (
    <ui-div className="flex w-full flex-col gap-2 *:m-0">
      <p className="heading-2">A paragraph styled like an h2</p>
      <h2 className="heading-4">An h2 styled like an h4</h2>
    </ui-div>
  )
}

function overridesShowcase() {
  return (
    <ui-div className="flex w-full flex-col gap-2 *:m-0">
      <h1 className="text-2xl">h1 with text-2xl</h1>
      <h2 className="leading-loose tracking-normal">h2 with leading-loose and tracking-normal</h2>
      <h3 className="text-primary-600">h3 with text-primary-600</h3>
    </ui-div>
  )
}
