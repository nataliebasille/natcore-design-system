import { Header } from "./_ui/header/header";
import {
  Sidebar,
  SidebarGroup,
  SidebarLink,
} from "./_ui/sidebar/sidebar-content";
import "./globals.css";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "./_ui/theme-provider";
import { SidebarProvider } from "./_ui/sidebar/sidebar-provider";
import {
  buildDocsNav,
  listDocsEntries,
  type DocsNavNode,
} from "@/server/docs-index";
import Script from "next/script";
import { THEME_STORAGE_KEY } from "@/utlls/constants";

const roboto = Roboto({ subsets: ["latin"] });

export const metadata = {
  title: "Natcore Design System",
  icons: {
    icon: "/logo.svg",
  },
};

function initTheme(storageKey: string) {
  try {
    console.log(`Initializing theme from localStorage with key: ${storageKey}`);
    const theme = localStorage.getItem(storageKey);
    console.log(`Initializing theme from localStorage: ${theme}`);
    if (theme) {
      document.documentElement.dataset.theme = theme;
    }
  } catch (err) {
    console.error("Failed to initialize theme from localStorage", err);
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nav = buildDocsNav(await listDocsEntries());
  return (
    <html lang="en" className={roboto.className} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css"
        />
      </head>
      <body className="grid h-screen w-screen grid-cols-[minmax(16rem,20rem)_minmax(32rem,1fr)] grid-rows-[auto_1fr] overflow-hidden bg-surface-50 palette-surface max-tablet:grid-cols-1 max-tablet:grid-rows-[auto_auto_1fr]">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(${initTheme.toString()})(${JSON.stringify(THEME_STORAGE_KEY)});`,
          }}
        />
        <ThemeProvider>
          <SidebarProvider>
            <Header className="col-span-2 border-b border-b-surface-600/30 bg-surface-50" />
            <Sidebar className="min-h-0 overflow-y-auto border-r border-r-surface-600/30 bg-surface-100 max-tablet:mt-[50px] max-tablet:w-full max-tablet:border-r-0">
              <SidebarGroup header="Getting Started">
                <SidebarLink href="/">Introduction</SidebarLink>
                <SidebarLink href="/installation">Installation</SidebarLink>
              </SidebarGroup>

              <SidebarGroup header="Core">
                <SidebarLink href="/core/tokens">Tokens</SidebarLink>
                <SidebarLink href="/core/theming">Theming</SidebarLink>
                <SidebarLink href="/core/palette">Palette</SidebarLink>
              </SidebarGroup>

              {renderSidebarNav(nav)}
            </Sidebar>
            <main className="min-h-0 min-w-0 overflow-x-hidden overflow-y-auto bg-surface-50 max-tablet:col-span-2">
              {children}
            </main>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

function renderSidebarNav(nodes: DocsNavNode[], nested = false) {
  return nodes.map((node) =>
    node.kind === "link" ?
      <SidebarLink key={node.href} href={node.href}>
        {node.label}
      </SidebarLink>
    : <SidebarGroup key={node.label} header={node.label} nested={nested}>
        {renderSidebarNav(node.children, true)}
      </SidebarGroup>,
  );
}