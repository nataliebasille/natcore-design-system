import { Header } from "./_ui/header";
import { Sidebar, SidebarGroup, SidebarLink } from "./_ui/sidebar";
import "./globals.css";
import { Roboto } from "next/font/google";
import { ThemeProvider } from "./_ui/theme-provider";

const roboto = Roboto({ subsets: ["latin"] });

export const metadata = {
  title: "Natcore Design System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.className} suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css"
        />
      </head>
      <body className="bg-tone-50-surface palette-surface grid h-screen w-screen grid-cols-[minmax(16rem,20rem)_minmax(32rem,1fr)] grid-rows-[auto_1fr] overflow-hidden max-md:grid-cols-1">
        <ThemeProvider>
          <Header className="bg-tone-50-surface border-b-tone-600-surface/30 col-span-2 border-b" />
          <Sidebar className="max-md:tray-left bg-tone-100-surface border-r-tone-600-surface/30 h-full border-r max-md:mt-[46px]">
            <SidebarGroup header="Getting Started">
              <SidebarLink href="/">Introduction</SidebarLink>
              <SidebarLink href="/installation">Installation</SidebarLink>
            </SidebarGroup>

            <SidebarGroup header="Core"></SidebarGroup>

            <SidebarGroup header="Components">
              <SidebarLink href="/component/button">Button</SidebarLink>
              <SidebarLink href="/component/button-group">
                Button Group
              </SidebarLink>
              <SidebarLink href="/component/card">Card</SidebarLink>
              <SidebarLink href="/component/modal">Modal</SidebarLink>
              <SidebarLink href="/component/tabs">Tabs</SidebarLink>
            </SidebarGroup>
          </Sidebar>
          <main className="bg-tone-50-surface overflow-x-hidden px-4 max-md:col-span-2">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
