// components/NavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { twMerge } from "tailwind-merge";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  activeClassName?: string;
  className?: string;
}

export default function NavLink({
  href,
  activeClassName,
  className,
  children,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      // Apply conditional CSS classes
      className={twMerge(className, isActive && activeClassName)}
    >
      {children}
    </Link>
  );
}
