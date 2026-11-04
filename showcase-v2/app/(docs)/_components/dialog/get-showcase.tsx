/** @jsxImportSource @nataliebasille/preview-jsx-runtime */

import { twMerge } from 'tailwind-merge'
import type { DialogControlValues } from './dialog-playground-controls'

const DIALOG_ID = 'dialog-playground'

const PLACEMENT_CLASS_NAMES = {
  center: 'dialog',
  top: 'dialog-top',
  bottom: 'dialog-bottom',
} as const

const BACKDROP_CLASS_NAMES = {
  default: '',
  blur: 'backdrop:bg-black/60 backdrop:backdrop-blur-md',
  none: 'dialog-backdrop-none',
} as const

export function getDialogPlaygroundShowcase(values: DialogControlValues) {
  const className = twMerge(
    PLACEMENT_CLASS_NAMES[values.placement],
    'card-soft',
    BACKDROP_CLASS_NAMES[values.backdrop]
  )

  return (
    <>
      <button className="btn-solid/primary" commandfor={DIALOG_ID} command="show-modal">
        Open dialog
      </button>
      <dialog
        id={DIALOG_ID}
        className={className}
        closedby={values.dismissal}
        aria-labelledby={`${DIALOG_ID}-title`}
      >
        <header data-slot="header">
          <p id={`${DIALOG_ID}-title`} className="font-semibold">
            Invite teammates
          </p>
        </header>
        <div data-slot="content">
          <p className="text-sm">Teammates get an email with a link to join this workspace.</p>
        </div>
        <footer data-slot="footer" className="flex justify-end gap-2">
          <button className="btn-ghost/surface" commandfor={DIALOG_ID} command="close">
            Cancel
          </button>
          <button className="btn-solid/primary" commandfor={DIALOG_ID} command="close">
            Send invites
          </button>
        </footer>
      </dialog>
    </>
  )
}
