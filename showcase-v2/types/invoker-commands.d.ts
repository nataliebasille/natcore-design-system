import 'react'

// HTML invoker commands (Chrome/Edge 135, Firefox 144, Safari 26.2) and
// interest invokers (Chrome/Edge 142) aren't in @types/react yet. Lowercase
// names render as plain attributes without warnings.
declare module 'react' {
  interface ButtonHTMLAttributes<T> {
    commandfor?: string
    command?:
      | 'show-modal'
      | 'close'
      | 'request-close'
      | 'show-popover'
      | 'hide-popover'
      | 'toggle-popover'
      | `--${string}`
    interestfor?: string
  }

  interface AnchorHTMLAttributes<T> {
    interestfor?: string
  }
}
