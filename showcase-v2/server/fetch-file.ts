import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import path from 'path'

const APP_DIR = 'app'
const PUBLIC_DIR = 'public'

function getShowcaseRoot() {
  const cwd = process.cwd()

  if (existsSync(path.resolve(cwd, APP_DIR))) {
    return cwd
  }

  const nested = path.resolve(cwd, 'showcase-v2')
  if (existsSync(path.resolve(nested, APP_DIR))) {
    return nested
  }

  throw new Error('Unable to resolve showcase-v2 root directory.')
}

function ensureAllowedFile(resolvedFilePath: string, allowedRoots: string[]) {
  const normalized = path.normalize(resolvedFilePath)
  const isAllowed = allowedRoots.some((root) => {
    const normalizedRoot = path.normalize(root + path.sep)
    return normalized.startsWith(normalizedRoot)
  })

  if (!isAllowed) {
    throw new Error('Access to this file path is not allowed.')
  }
}

export async function fetchFile(appOrPublicRelativePath: string) {
  const showcaseRoot = getShowcaseRoot()
  const appRoot = path.resolve(showcaseRoot, APP_DIR)
  const publicRoot = path.resolve(showcaseRoot, PUBLIC_DIR)
  const requestedPath = path.resolve(appRoot, appOrPublicRelativePath)

  ensureAllowedFile(requestedPath, [appRoot, publicRoot])

  try {
    return await readFile(requestedPath, 'utf8')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown read error'
    throw new Error(`Failed to read file at '${appOrPublicRelativePath}': ${message}`)
  }
}
