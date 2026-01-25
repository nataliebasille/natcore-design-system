// components/NavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Component } from "react";
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
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Component className={twMerge(className, isActive ? "active" : "")}>
      <Link href={href}>{children}</Link>
    </Component>
  );
}
