// components/NavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { twMerge } from "tailwind-merge";
import { useSidebar } from "./sidebar/sidebar-provider";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  component?: React.ElementType;
}

export default function NavLink({
  href,
  className,
  children,
  component: Component = "div",
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const { toggle } = useSidebar();

  return (
    <Component className={twMerge(className, isActive ? "active" : "")}>
      <Link href={href} className="block" onClick={toggle}>
        {children}
      </Link>
    </Component>
  );
}
