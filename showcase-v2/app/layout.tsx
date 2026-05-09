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
import { listTailwindModules } from "@/server/get-tailwind-modules";
import { capitalize } from "@/utlls/capitalize";
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
  const links = await getLinks();
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

              <SidebarGroup header="Core"></SidebarGroup>

              {renderSidebarLinks(links)}
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

function renderSidebarLinks(links: Links) {
  return Object.entries(links).map(([key, value]) => {
    if (value.type === "link") {
      return (
        <SidebarLink key={key} href={value.link}>
          {value.name}
        </SidebarLink>
      );
    }

    if (value.type === "group") {
      return (
        <SidebarGroup key={key} header={value.name}>
          {renderSidebarLinks(value.links)}
        </SidebarGroup>
      );
    }
  });
}

async function getLinks() {
  const tailwindModules = await listTailwindModules();

  return groupModules(tailwindModules);
}

type Links = Record<
  string,
  | { type: "link"; name: string; link: string }
  | { type: "group"; name: string; links: Links }
>;

function groupModules(
  modules: Awaited<ReturnType<typeof listTailwindModules>>,
  basePath = "",
): Links {
  const grouped = Object.groupBy(modules, (module) => module.category[0] ?? "");

  const { "": top, ...childGroups } = grouped;
  return {
    ...(top?.reduce((acc, module) => {
      acc[module.name] = {
        type: "link",
        link: `${basePath}/${module.name}`,
        name: capitalize(module.name),
      };

      return acc;
    }, {} as Links) ?? {}),

    ...Object.fromEntries(
      Object.entries(childGroups).map(
        ([category, modules]) =>
          [
            capitalize(category),
            {
              type: "group",
              name: capitalize(category),
              links: groupModules(
                modules?.map((m) => ({
                  category: m.category.slice(1),
                  name: m.name,
                })) ?? [],
                `${basePath}/${category}`,
              ),
            },
          ] as const,
      ),
    ),
  } satisfies Links;
}
