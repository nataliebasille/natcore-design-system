// components/NavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Component, useCallback } from "react";
import { twMerge } from "tailwind-merge";

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

  const onClick = useCallback(() => {
    linkRef.current?.click();
  }, []);

  return (
    <Component
      className={twMerge(className, isActive ? "active" : "")}
      onClick={onClick}
    >
      <Link ref={linkRef} href={href}>
        {children}
      </Link>
    </Component>
  );
}
