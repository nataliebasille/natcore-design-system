'use client';

import { ReactNode } from 'react';
import { List } from '@natcore/design-system-react';
import { usePathname, useRouter } from 'next/navigation';
import classnames from 'classnames';

type SidebarItemProps = {
  href: string;
  children: ReactNode;
};
export const SidebarItem = ({ href, children }: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <List.Item
      className={classnames({ active: pathname === href })}
      onClick={() => router.push(href)}
    >
      {children}
    </List.Item>
  );
};
