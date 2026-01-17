import { component } from "./component";
import { cssvar } from "./cssvar";

// Example demonstrating typed cssvar autocomplete
const buttonComponent = component("btn", {
  vars: {
    "size-base": "1rem",
    "bg-color": "#fff",
    "border-radius": "4px",
  },
  base: {
    // When you type cssvar(" here, you should see autocomplete for:
    // - "size-base"
    // - "bg-color"
    // - "border-radius"
    padding: cssvar("size-base"),
    backgroundColor: cssvar("bg-color"),
    borderRadius: cssvar("border-radius"),
  },
  variants: {
    large: {
      // Autocomplete should also work in variants
      padding: cssvar("size-base"),
    },
    primary: {
      backgroundColor: cssvar("bg-color"),
    },
  },
});

// This should cause a type error if uncommented (var doesn't exist):
// const invalidComponent = component("btn2", {
//   vars: {
//     "size": "1rem",
//   },
//   base: {
//     padding: cssvar("invalid-var"), // Type error: "invalid-var" is not a key in vars
//   }
// });
