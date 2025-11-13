import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      '@nataliebasille/natcore-design-system-v2': path.resolve(
        __dirname,
        '../packages/core-v2/dist'
      ),
    },
  },
}

export default nextConfig
