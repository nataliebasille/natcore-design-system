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
      <body className="grid h-screen w-screen grid-rows-[auto_1fr] grid-cols-[minmax(16rem,20rem)_1fr] overflow-hidden bg-50-surface">
        <Header className="col-span-2 bg-50-surface border-b-600-surface/30 border-b" />
        <Sidebar className="bg-100-surface border-r-600-surface/30 border-r">
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
        <main className="p-6 bg-50-surface overflow-auto">{children}</main>
      </body>
    </html>
  );
}
