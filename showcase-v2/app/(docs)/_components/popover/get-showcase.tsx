/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import type { PopoverControlValues } from './popover-playground-controls'

const POPOVER_ID = 'popover-playground'

const DELAY_CLASS_NAMES = {
  default: '',
  none: 'popover-trigger-delay-0',
  slow: 'popover-trigger-delay-1000',
} as const

const CSS_TRIGGER_CLASS_NAMES = {
  hover: 'popover-trigger-hover',
  focus: 'popover-trigger-focus',
} as const

const TRIGGER_LABELS = {
  click: 'Click to open',
  interest: 'Hover or focus to open',
  hover: 'Hover to open',
  focus: 'Tab to or click to open',
  checked: 'Click to toggle',
} as const

export function getPopoverPlaygroundShowcase(values: PopoverControlValues) {
  const popoverClassName = classNames(
    `popover-${values.placement}`,
    values.flip === 'on' && 'popover-flip',
    'card-soft w-56 p-3 text-sm'
  )
  const delay = DELAY_CLASS_NAMES[values.delay]
  const label = TRIGGER_LABELS[values.trigger]
  const content = (
    <>
      <p className="font-semibold">Share link</p>
      <p className="opacity-80">Anyone with the link can view this file.</p>
    </>
  )

  // Native triggers need no wrapper.
  if (values.trigger === 'click' || values.trigger === 'interest') {
    return (
      <>
        {values.trigger === 'click' ? (
          <button className="btn-solid/primary" commandfor={POPOVER_ID} command="toggle-popover">
            {label}
          </button>
        ) : (
          <button className={classNames('btn-solid/primary', delay)} interestfor={POPOVER_ID}>
            {label}
          </button>
        )}
        <div
          id={POPOVER_ID}
          popover={values.trigger === 'click' ? 'auto' : 'hint'}
          className={popoverClassName}
        >
          {content}
        </div>
      </>
    )
  }

  return (
    <span className="popover-anchor">
      {values.trigger === 'checked' ? (
        <label className="popover-trigger-checked btn-solid/primary">
          <input type="checkbox" className="sr-only" />
          {label}
        </label>
      ) : (
        <button
          className={classNames(
            'btn-solid/primary',
            CSS_TRIGGER_CLASS_NAMES[values.trigger],
            delay
          )}
        >
          {label}
        </button>
      )}
      <div data-slot="popover" className={popoverClassName}>
        {content}
      </div>
    </span>
  )
}

function classNames(...names: (string | false | undefined)[]) {
  return names.filter(Boolean).join(' ')
}
