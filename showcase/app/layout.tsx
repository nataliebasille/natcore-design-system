import { Sidebar } from '@/components';
import './globals.css';
import { Header } from '@/components/header/Header';

export const metadata = {
  title: 'Natcore Design System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className='h-screen w-screen'>
        <div className='layer'>
          <input type='checkbox' className='layer-drawer-toggle' />
          <div className='layer-drawer w-80 bg-gray-200 p-5 md:layer-drawer-fixed'>
            <Sidebar />
          </div>
          <div className='layer layer-content'>
            <header className='layer-drawer-top layer-drawer layer-drawer-fixed px-6 pt-2'>
              <Header />
            </header>
            <main className='layer-content p-6'>{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
