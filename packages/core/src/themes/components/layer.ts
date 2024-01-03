/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { type PluginAPI } from "tailwindcss/types/config";

export default (theme: PluginAPI["theme"]) => ({
  ".layer": {
    display: "grid",
    gridTemplateColumns: "auto 1fr auto",
    gridTemplateRows: "auto 1fr auto",
    position: "relative",
    width: theme("width.full")!,
    height: theme("height.full")!,
    overflow: "hidden",

    "> .layer-overlay": {
      display: "none",
    },

    "> .layer-drawer-toggle": {
      display: "none",

      "& ~ .layer-drawer": {
        transform: "translateX(-100%)",
      },

      "&:checked ~ .layer-drawer": {
        transform: "translateX(0)",
      },

      "&:checked ~ .layer-overlay": {
        display: "block",
        position: "absolute",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        zIndex: theme("zIndex.10")!,
        backgroundColor: theme("colors.black")!,
        opacity: "0.5",
      },
    },

    "> .layer-drawer": {
      position: "absolute",
      top: "0",
      left: "0",
      bottom: "0",
      zIndex: theme("zIndex.20")!,
      transition: "transform 0.3s ease-in-out",
    },

    "> .layer-content": {
      gridColumn: "1 / -1",
      gridRow: "1 / -1",
    },

    "&.layer-fixed": {
      "> .layer-drawer": {
        transform: "translateX(0)",
        position: "relative",
        gridColumn: "1",
        gridRow: "1 / -1",
      },

      "> .layer-content": {
        gridColumn: "2 / -1",
        gridRow: "1 / -1",
      },

      "> .layer-overlay": {
        display: "none !important",
      },
    },

    "&.layer-right": {
      "> .layer-drawer": {
        top: "0",
        right: "0",
        bottom: "0",
      },

      "&.layer-fixed": {
        "> .layer-drawer": {
          gridColumn: "-1 !important",
          gridRow: "1 / -1 !important",
        },

        "> .layer-content": {
          gridColumn: "1 / -2 !important",
          gridRow: "1 / -1 !important",
        },
      },
    },

    "&.layer-top": {
      "> .layer-drawer": {
        top: "0",
        right: "0",
        left: "0",
      },

      "&.layer-fixed": {
        "> .layer-drawer": {
          gridColumn: "1 / -1 !important",
          gridRow: "1 !important",
        },

        "> .layer-content": {
          gridColumn: "1 / -1 !important",
          gridRow: "2 / -1 !important",
        },
      },
    },

    "&.layer-bottom": {
      "> .layer-drawer": {
        right: "0",
        bottom: "0",
        left: "0",
      },

      "&.layer-fixed": {
        "> .layer-drawer": {
          gridColumn: "1 / -1 !important",
          gridRow: "-1 !important",
        },

        "> .layer-content": {
          gridColumn: "1 / -1 !important",
          gridRow: "1 / 2 !important",
        },
      },
    },

    ".layer-content": {
      overflow: "auto",
      position: "relative",
    },
  },
});
