// components/NavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Component, useCallback } from "react";
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
  const linkRef = React.useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  const isActive = pathname === href;
  const { toggle } = useSidebar();
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!linkRef.current?.contains(e.target as Node)) {
        linkRef.current?.click();
      }
      toggle();
    },
    [toggle],
  );
  const preventLinkPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Component
      className={twMerge(className, isActive ? "active" : "")}
      onClick={handleClick}
    >
      <Link ref={linkRef} href={href} onClick={preventLinkPropagation}>
        {children}
      </Link>
    </Component>
  );
}
