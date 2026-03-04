import { dsl, utility } from "@nataliebasille/natcore-css-engine";

export default [
  utility("form-label", "flex", "flex-col", {
    $: {
      [dsl.child(dsl.parent(), "*:not(input, select, textarea)")]: {
        "font-size": dsl.cssvar("--text-sm"),
        "font-weight": dsl.cssvar("--font-weight-medium"),
        color: dsl.cssvar("--color-tone-500"),
      },
    },
  }),

  utility("form-input", {
    appearance: "none",
    "background-color": dsl.cssvar("--color-tone-100-surface"),
    color: dsl.cssvar("--color-on-tone-100-surface"),
    "border-color": dsl.cssvar("--color-tone-300-surface"),
    "border-style": "solid",
    "border-width": "1px",
    "border-radius": dsl.cssvar("--radius-md"),
    padding: ".5em 2em .5em 1em",
    "background-position": "right 0.5em center",
    "background-repeat": "no-repeat",
    "background-size": "1em 1em",
  }),

  utility("form-select", {
    "background-image":
      'url(\'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /%3E%3C/svg%3E\')',
  }),
];
