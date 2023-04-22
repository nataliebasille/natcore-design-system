import { Sidebar } from '@/components';
import './globals.css';
import { Header } from '@/components/header/Header';
import { SidebarContextProvider } from '@/providers/SidebarProvider';
import { SidebarToggle } from '@/components/sidebar/SidebarToggle';
import { SidebarOverlay } from '@/components/sidebar/SidebarOverlay';

export const metadata = {
  title: 'Natcore Design System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarContextProvider>
      <html lang='en'>
        <body className='h-screen w-screen'>
          <div className='md:layer-fixed layer'>
            <SidebarToggle />
            <SidebarOverlay />
            <div className='layer-top layer-fixed layer layer-content'>
              <header className='layer-drawer px-8 pt-2 md:px-12'>
                <Header />
              </header>
              <main className='layer-content p-8 md:p-12'>{children}</main>
            </div>

            <div className='layer-drawer w-80 bg-gray-200 p-5'>
              <Sidebar />
            </div>
          </div>
        </body>
      </html>
    </SidebarContextProvider>
  );
}
