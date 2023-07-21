"use client";

import { type ReactNode, useCallback } from "react";
import { List } from "@natcore/design-system-react";
import { usePathname, useRouter } from "next/navigation";
import classnames from "classnames";
import { useSidebar } from "@/providers/SidebarProvider";

type SidebarItemProps = {
  href: string;
  children: ReactNode;
};
export const SidebarItem = ({ href, children }: SidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { toggle } = useSidebar();
  const handleClick = useCallback(() => {
    router.push(href);
    toggle();
  }, [toggle, router, href]);

  return (
    <List.Item
      className={classnames({ active: pathname === href })}
      onClick={handleClick}
    >
      {children}
    </List.Item>
  );
};
