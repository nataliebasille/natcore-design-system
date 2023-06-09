import { Sidebar } from "@/components";
import "./globals.css";
import { Header } from "@/components/header/Header";
import { SidebarOverlay } from "@/components/sidebar/SidebarOverlay";
import { SidebarToggle } from "@/components/sidebar/SidebarToggle";
import { SidebarContextProvider } from "@/providers/SidebarProvider";

export const metadata = {
  title: "Natcore Design System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarContextProvider>
      <html lang="en">
        <head>
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/atom-one-dark.min.css"
          />
        </head>
        <body className="bg-surface-shades-100 h-screen w-screen">
          <div className="layer md:layer-fixed">
            <SidebarToggle />
            <SidebarOverlay />
            <div className="layer layer-top layer-fixed layer-content">
              <header className="layer-drawer px-4 pt-2 md:px-12">
                <Header />
              </header>
              <main className="layer-content p-8 md:p-12">{children}</main>
            </div>

            <div className="layer-drawer bg-surface-shades-200 w-72 p-5">
              <Sidebar />
            </div>
          </div>
        </body>
      </html>
    </SidebarContextProvider>
  );
}
