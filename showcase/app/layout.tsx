import { Sidebar } from '@/components';
import './globals.css';

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
      <body className='w-screen h-screen'>
        <div className='layer'>
          <input type='checkbox' className='layer-drawer-toggle' />
          <div className='layer-drawer md:layer-drawer-fixed bg-gray-200 w-80 p-5'>
            <Sidebar />
          </div>
          <main className='layer-content p-6'>{children}</main>
        </div>
      </body>
    </html>
  );
}
