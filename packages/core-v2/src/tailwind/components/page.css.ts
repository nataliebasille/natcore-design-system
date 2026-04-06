import { dsl, utility } from "@nataliebasille/css-engine";

export default utility("page-container", "overflow-hidden", {
  width: "100vw",
  height: "100vh",
  background: dsl.cssvar("--color-tone-100"),

  $: {
    [".sidebar"]: {
      position: "fixed",
      top: "0",
      bottom: "0",
      left: "0",
      width: "33.333333%",

      $: {
        ["+ .content"]: {
          position: "fixed",
          top: "0",
          bottom: "0",
          right: "0",
          width: "66.666667%",
        },
      },
    },

    ["@media(min-width: 768px)"]: {},
  },
});
