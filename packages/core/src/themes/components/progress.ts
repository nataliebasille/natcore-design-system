/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createVariants } from "../colors";

const progressVariants = createVariants("progress");
export default () => ({
  "@property --progress": {
    syntax: `"<length-percentage>"`,
    inherits: "true",
    initialValue: "0%",
  },

  ".radial-progress": {
    ...progressVariants,

    "--size": "64px",
    "--bar-width": "8px",
    fontSize: "2rem",
    width: "var(--size)",
    aspectRatio: "1 / 1",
    alignSelf: "flex-start",
    display: "grid",
    placeItems: "center",
    background: `conic-gradient(
        ${progressVariants("base")} var(--progress),
        ${progressVariants("base", 0.2)} 0%
    )`,
    borderRadius: "50vmax",
    transition: "--progress 500ms linear",
    maskImage:
      "radial-gradient(circle at center, transparent calc(var(--size) / 2 - var(--bar-width)), white calc(var(--size) / 2 - var(--bar-width)))",

    "&.progress-sm": {
      "--size": "48px",
      "--bar-width": "6px",
    },

    "&.progress-lg": {
      "--size": "88px",
      "--bar-width": "10px",
    },
  },
});
