import plugin from "tailwindcss/plugin";

export {};
export type PluginAPI = Parameters<Parameters<typeof plugin>[0]>[0];