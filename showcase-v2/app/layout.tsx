import { Header } from "./_ui/header";
import { Sidebar, SidebarGroup, SidebarLink } from "./_ui/sidebar";
import "./globals.css";
import { Roboto } from "next/font/google";

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
    <html lang="en" className={roboto.className}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css"
        />
      </head>
      <body className="bg-surface-50 grid h-screen w-screen grid-cols-[minmax(16rem,20rem)_1fr] grid-rows-[auto_1fr] overflow-hidden">
        <Header className="bg-surface-50 border-b-surface-600/30 col-span-2 border-b" />
        <Sidebar className="bg-surface-100 border-r-surface-600/30 border-r">
          <SidebarGroup header="Getting Started">
            <SidebarLink href="/">Introduction</SidebarLink>
            <SidebarLink href="/installation">Installation</SidebarLink>
          </SidebarGroup>

          <SidebarGroup header="Core"></SidebarGroup>

          <SidebarGroup header="Components">
            <SidebarLink href="/button">Button</SidebarLink>
            <SidebarLink href="/card">Card</SidebarLink>
            <SidebarLink href="/modal">Modal</SidebarLink>
            <SidebarLink href="/tabs">Tabs</SidebarLink>
          </SidebarGroup>
        </Sidebar>
        <main className="bg-surface-50 overflow-auto p-6">{children}</main>
      </body>
    </html>
  );
}
