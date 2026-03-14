/** @jsxImportSource @/lib/preview-jsx-runtime */

import { uiAttr } from "@/lib/preview-jsx-runtime/jsx-runtime";

function AlertCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}

export default (
  <>
    <button
      className="btn-solid/primary btn-icon"
      {...uiAttr({
        "aria-label": "outline icon button",
      })}
    >
      <ui>
        <AlertCircleIcon />
      </ui>

      <markup>{"<!-- icon svg -->"}</markup>
    </button>

    <button
      className="btn-outline/primary btn-icon"
      {...uiAttr({
        "aria-label": "outline icon button",
      })}
    >
      <ui>
        <AlertCircleIcon />
      </ui>

      <markup>{"<!-- icon svg -->"}</markup>
    </button>

    <button
      className="btn-ghost/primary btn-icon"
      {...uiAttr({
        "aria-label": "ghost icon button",
      })}
    >
      <ui>
        <AlertCircleIcon />
      </ui>

      <markup>{"<!-- icon svg -->"}</markup>
    </button>
  </>
);
