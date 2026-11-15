// MOVE TO REACT COMPONENT
export default [];

// import { component_deprecated, dsl } from "@nataliebasille/css-engine";

// const INLINE_GROUP = {
//   "--group-display": "inline-flex",
//   "--group-direction": "row",
//   "--group-inline-padding": dsl.spacing("1"),
//   "--group-block-padding": dsl.spacing("1"),
//   "--group-radius": dsl.cssvar("--radius-lg"),
// };

// export default component_deprecated("radio-group", {
//   variants: {
//     solid: {
//       ...INLINE_GROUP,
//       "--group-bg": dsl.current(900),
//       "--hover-bg": dsl.current(700),
//       "--hover-fg": dsl.currentText(700),
//       "--active-bg": dsl.current(800),
//       "--active-fg": dsl.currentText(800),
//     },
//   },
//   styles: [
//     {
//       display: dsl.match.variable("--group-display"),
//       "flex-direction": dsl.match.variable("--group-direction"),
//       "background-color": dsl.match.variable("--group-bg"),
//       "padding-inline": dsl.match.variable("--group-inline-padding"),
//       "padding-block": dsl.match.variable("--group-block-padding"),
//       "border-radius": dsl.match.variable("--group-radius"),

//       $: {
//         "& > *": [
//           "flex-1",
//           "inline-flex",
//           "items-center",
//           "cursor-pointer",
//           "rounded-lg",
//           {
//             $: {
//               ["&:hover"]: {
//                 "background-color": dsl.match.variable("--hover-bg"),
//                 color: dsl.match.variable("--hover-fg"),
//               },
//             },
//           },
//         ],
//         ["input[type='radio']"]: ["hidden"],
//       },
//     },
//   ],
// });
