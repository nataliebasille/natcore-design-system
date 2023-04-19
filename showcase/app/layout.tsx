import { Sidebar } from '@/components/sidebar';
import './globals.css';
import { Drawer } from '@natcore/design-system-react';

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
      <body className='page-container bg-gray-100'>
        <Drawer open className='bg-gray-200 w-80 p-5'>
          <Sidebar />
        </Drawer>
        <main className='content'>{children}</main>
      </body>
    </html>
  );
}
