---
"@nataliebasille/natcore-design-system": patch
---

Fix `@natcore-palettes` expander treating the token inside comments/strings as a real at-rule.

The raw-string expander backing the PostCSS and Vite plugins scanned for `@natcore-palettes` without skipping CSS comments or string literals, so a comment (or string value) that merely mentioned the token false-matched and corrupted the stylesheet. The scan and brace matcher are now comment- and string-aware, so only real at-rule blocks are expanded and surrounding comments survive verbatim.
