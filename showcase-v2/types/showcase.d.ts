import type {
  ComponentBuilder,
  ComponentDocMeta,
} from "@nataliebasille/css-engine";
import type { ShowcaseJsxNode } from "@nataliebasille/preview-jsx-runtime";
import type { UtilityTag } from "@/ui/doc/utility-reference";

export {};

declare global {
  type DocShowcaseEntry = {
    title?: string;
    description?: string;
    content: ShowcaseJsxNode;
  };

  type DocSectionTableEntry = {
    label: string;
    content: ShowcaseJsxNode | string | number;
  };

  type DocStandaloneSection = {
    title: string;
    description?: string;
    tags?: UtilityTag[];
    table?: DocSectionTableEntry[];
    showcases?: DocShowcaseEntry[];
  };

  type Documentation<T extends ComponentBuilder> = ComponentDocMeta<T> & {
    atAGlance: ShowcaseJsxNode;
    sections?: DocStandaloneSection[];
    slots?: {
      title?: string;
      description?: string;
      showcases?: DocShowcaseEntry[];
    };
    customVariants?: {
      title?: string;
      description?: string;
      showcases?: DocShowcaseEntry[];
    };

    components: {
      [K in keyof ComponentDocMeta<T>["components"]]: {
        showcases?: DocShowcaseEntry[];
      };
    };

    utilities?: {
      [K in keyof ComponentDocMeta<T>["utilities"]]: {
        showcases?: DocShowcaseEntry[];
      };
    };
  };
}
