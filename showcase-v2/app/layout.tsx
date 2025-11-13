import { Sidebar } from '@/components'
import './globals.css'
import { Header } from '@/app/+header/Header'
import { SidebarOverlay } from '@/app/+sidebar/SidebarOverlay'
import { SidebarToggle } from '@/app/+sidebar/SidebarToggle'
import { SidebarContextProvider } from '@/providers/SidebarProvider'

export const metadata = {
  title: 'Natcore Design System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarContextProvider>
      <html lang="en">
        <head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css"
          />
        </head>
        <body className="grid h-screen w-screen grid-cols-[auto_1fr] overflow-hidden">
          <svg
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 120 120"
            width="1em"
            height="1em"
            className="hidden"
          >
            <defs>
              <g id="anchor">
                <polygon points="0,120 0,19.019237886466840597 19.019237886466840597,0 90,0 90,8 23.638040039983846713,8 8,23.638040039983846713 8,120 " />
              </g>

              <symbol id="natcore-logo" viewBox="0 0 120 120">
                <use href="#anchor" fill="currentColor" />
                <use href="#anchor" fill="currentColor" transform="rotate(180 60 60)" />

                <g id="n" fill="currentColor">
                  <polygon points="18,108 18,29.411542731880104358 29.411542731880104358,18 90.588457268119895642,84 90,12 101.411542731880104358,12 102,90.588457268119895642 90.588457268119895642,102 29.411542731880104358,36 29.411542731880104358,108" />
                </g>
              </symbol>
            </defs>
          </svg>

          <Sidebar />

          <div className="flex min-w-0 flex-col">
            <header className="flex-initial px-4 pt-2 md:px-12">
              <Header />
            </header>
            {/* bg-gradient-to-br */}
            <main className="from-primary-100/30 to-surface-200 dark:to-surface-700 layer-content flex-1 overflow-auto scroll-smooth from-10% via-30% p-4 sm:p-8 md:p-12">
              {children}
            </main>
          </div>
        </body>
      </html>
    </SidebarContextProvider>
  )
}
