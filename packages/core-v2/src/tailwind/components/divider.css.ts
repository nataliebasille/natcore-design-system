import { component, dsl } from "@nataliebasille/natcore-css-engine";

export default [
  component("divider", {
    variants: {
      default: {
        "--divider-color": dsl.current(500),
      },
    },
    styles: [
      "flex",
      "items-center",
      "self-stretch",
      "my-4",
      "tracking-wide",
      "font-bold",
      {
        margin: `${dsl.spacing("4")} 0`,
        "letter-spacing": dsl.cssvar("--tracking-wide"),
        color: dsl.cssvar("--divider-color"),
        "font-weight": dsl.cssvar("--font-weight-bold"),

        $: {
          [dsl.select.list(
            dsl.select.pseudo("before"),
            dsl.select.pseudo("after"),
          )]: {
            content: '""',
            flex: "1",
            height: "1px",
            "background-color": dsl.cssvar("--divider-color"),
          },
          [dsl.select.parent(":empty::after")]: {
            "margin-left": "0",
          },
          [dsl.select.parent(":empty::before")]: {
            "margin-right": "0",
          },
          [dsl.select.pseudo("before")]: {
            "margin-right": `${dsl.spacing("2")}`,
          },
          [dsl.select.pseudo("after")]: {
            "margin-left": `${dsl.spacing("2")}`,
          },
        },
      },
    ],
  }),

  component("divider-v", {
    variants: {
      default: {
        "--divider-color": dsl.current(500),
      },
    },
    styles: [
      "flex",
      "flex-col",
      "items-center",
      {
        margin: `0 ${dsl.spacing("4")}`,
        "letter-spacing": dsl.cssvar("--tracking-wide"),
        color: dsl.cssvar("--divider-color"),
        "font-weight": dsl.cssvar("--font-weight-bold"),

        $: {
          [dsl.select.list(
            dsl.select.pseudo("before"),
            dsl.select.pseudo("after"),
          )]: {
            content: '""',
            flex: "1",
            width: "1px",
            "background-color": dsl.cssvar("--divider-color"),
          },
          [dsl.select.parent(":empty::after")]: {
            "margin-top": "0",
          },
          [dsl.select.parent(":empty::before")]: {
            "margin-bottom": "0",
          },
          [dsl.select.pseudo("before")]: {
            "margin-bottom": `${dsl.spacing("2")}`,
          },
          [dsl.select.pseudo("after")]: {
            "margin-top": `${dsl.spacing("2")}`,
          },
        },
      },
    ],
  }),
];
