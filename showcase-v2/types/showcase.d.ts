import type {
  ComponentBuilder,
  ComponentDocMeta,
} from "@nataliebasille/css-engine";
import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";

export {};

declare global {
  type DocShowcaseEntry = {
    title?: string;
    description?: string;
    content: ShowcaseJsxNode;
  };

  type Documentation<T extends ComponentBuilder> = ComponentDocMeta<T> & {
    atAGlance: ShowcaseJsxNode;

    components: {
      [K in keyof ComponentDocMeta<T>["components"]]: {
        showcases?: DocShowcaseEntry[];
      };
    };

    utilities: {
      [K in keyof ComponentDocMeta<T>["utilities"]]: {
        showcases?: DocShowcaseEntry[];
      };
    };
  };
}
