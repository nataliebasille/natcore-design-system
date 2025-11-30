import { readdir } from 'node:fs/promises'
import path from 'path'

import { Divider, List } from '@nataliebasille/natcore-design-system-react'
import { Logo } from './Logo'
import { SidebarItem } from './SidebarItem'
import { useSidebar } from '@/providers/SidebarProvider'
import { SidebarToggle } from './SidebarToggle'

export const getDirectories = async (source: string) => {
  const dir = path.resolve(process.cwd(), `app`, source)
  const entries = await readdir(dir, { withFileTypes: true })
  return entries.filter((e) => e.isDirectory()).map((e) => e.name)
}

export const Sidebar = async () => {
  // const [components, forms] = await Promise.all([
  //   createSidebarItems("components"),
  //   createSidebarItems("forms"),
  // ]);

  return (
    <div className="tray-inline max-md:tray-left border-surface-700 bg-surface-50 h-full w-72 border-r p-5">
      <SidebarToggle />
      <Logo />
      <Divider />
      <div className="text-secondary-800 dark:text-secondary-300 mb-2 font-bold uppercase tracking-wider">
        Components
      </div>
      {/* <List.Container color="primary">{components}</List.Container> */}

      <div className="text-secondary-800 dark:text-secondary-300 mb-2 mt-8 font-bold uppercase tracking-wider">
        Forms
      </div>

      {/* <List.Container color="primary">{forms}</List.Container> */}
    </div>
  )
}

function capitalizeEachWord(s: string) {
  return s
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function dashesToSpace(s: string) {
  return s.replace(/-/g, ' ')
}

async function createSidebarItems(type: 'components' | 'forms') {
  const dirs = await getDirectories(type)

  return dirs.map((dir) => (
    <SidebarItem key={dir} href={`/${type}/${dir}`}>
      {capitalizeEachWord(dashesToSpace(dir))}
    </SidebarItem>
  ))
}
