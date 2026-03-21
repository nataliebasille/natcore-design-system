import natcorePluginDefault, {
  natcorePlugin,
  plugin,
  type NatcorePluginOptions,
} from "../../core-v2/src/tailwind/plugin.ts";

export type NatcorePluginFactory = typeof natcorePlugin;
export type NatcoreResolvedPlugin = ReturnType<typeof natcorePlugin>;

export type { NatcorePluginOptions };
export { natcorePluginDefault as default, natcorePlugin, plugin };
