import { component, dsl } from "@nataliebasille/natcore-css-engine";
import { currentBaseColor } from "../../shared/colors";

export default [
  component("divider", {
    themeable: "surface",
    variants: {
      default: {
        "--divider-color": currentBaseColor(500),
      },
    },
    styles: [
      "flex",
      "items-center",
      "self-stretch",
      {
        margin: `${dsl.spacing("4")} 0`,
        "letter-spacing": dsl.cssvar("--tracking-wide"),
        color: dsl.cssvar("--divider-color"),
        "font-weight": dsl.cssvar("--font-weight-bold"),

        $: {
          [dsl.list(dsl.pseudo("before"), dsl.pseudo("after"))]: {
            content: '""',
            flex: "1",
            height: "1px",
            "background-color": dsl.cssvar("--divider-color"),
          },
          [dsl.parent(":empty::after")]: {
            "margin-left": "0",
          },
          [dsl.parent(":empty::before")]: {
            "margin-right": "0",
          },
          [dsl.pseudo("before")]: {
            "margin-right": `${dsl.spacing("2")}`,
          },
          [dsl.pseudo("after")]: {
            "margin-left": `${dsl.spacing("2")}`,
          },
        },
      },
    ],
  }),

  component("divider-v", {
    themeable: "surface",
    variants: {
      default: {
        "--divider-color": currentBaseColor(500),
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
          [dsl.list(dsl.pseudo("before"), dsl.pseudo("after"))]: {
            content: '""',
            flex: "1",
            width: "1px",
            "background-color": dsl.cssvar("--divider-color"),
          },
          [dsl.parent(":empty::after")]: {
            "margin-top": "0",
          },
          [dsl.parent(":empty::before")]: {
            "margin-bottom": "0",
          },
          [dsl.pseudo("before")]: {
            "margin-bottom": `${dsl.spacing("2")}`,
          },
          [dsl.pseudo("after")]: {
            "margin-top": `${dsl.spacing("2")}`,
          },
        },
      },
    ],
  }),
];
