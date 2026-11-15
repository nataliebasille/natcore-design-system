/** The default export of a dynamically imported docs module. */
export function docsModuleDefault(mod: unknown): unknown {
  return typeof mod === 'object' && mod !== null && 'default' in mod ? mod.default : undefined
}
