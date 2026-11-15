'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

export type KeyboardShortcut = {
  /** `KeyboardEvent.key`, compared case-insensitively. */
  key: string
  /** The platform's command key: ⌘ on Apple platforms, Ctrl elsewhere. */
  mod?: boolean
  shift?: boolean
  alt?: boolean
}

/**
 * Calls `handler` when `shortcut` is pressed anywhere on the page. A shortcut
 * without `mod` or `alt` is ignored while the user is typing in a field. The
 * handler calls `event.preventDefault()` when it acts; if it returns early, the
 * browser's own shortcut runs.
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  handler: (event: KeyboardEvent) => void
) {
  const handlerRef = useRef(handler)
  const { key, mod = false, shift = false, alt = false } = shortcut

  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    const apple = isApplePlatform()

    function onKeyDown(event: KeyboardEvent) {
      const command = apple ? event.metaKey : event.ctrlKey
      const otherCommand = apple ? event.ctrlKey : event.metaKey
      const matches =
        event.key.toLowerCase() === key.toLowerCase() &&
        command === mod &&
        !otherCommand &&
        event.shiftKey === shift &&
        event.altKey === alt

      if (!matches || (!mod && !alt && isTypingIn(event.target))) return

      handlerRef.current(event)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key, mod, shift, alt])
}

/**
 * The shortcut as the user's platform writes it: `⌘K` on Apple platforms,
 * `Ctrl K` elsewhere. Renders the non-Apple form on the server.
 */
export function useShortcutLabel({ key, mod, shift, alt }: KeyboardShortcut) {
  const apple = useSyncExternalStore(subscribeToNothing, isApplePlatform, () => false)
  const name = key.length === 1 ? key.toUpperCase() : key

  if (apple) {
    return `${alt ? '⌥' : ''}${shift ? '⇧' : ''}${mod ? '⌘' : ''}${name}`
  }
  return [mod && 'Ctrl', alt && 'Alt', shift && 'Shift', name].filter(Boolean).join(' ')
}

function isApplePlatform() {
  const { userAgentData } = navigator as Navigator & { userAgentData?: { platform: string } }
  return /mac|iphone|ipad|ipod/i.test(userAgentData?.platform || navigator.platform)
}

function isTypingIn(target: EventTarget | null) {
  return (
    target instanceof Element &&
    target.closest("input, textarea, select, [contenteditable='true']") !== null
  )
}

function subscribeToNothing() {
  return () => {}
}
