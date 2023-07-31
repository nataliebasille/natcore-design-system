"use client";

import { useRouter } from "next/navigation";
import { LogoSVG } from "@natcore/design-system-core";
import { useSidebar } from "@/providers/SidebarProvider";
import { useCallback } from "react";

export const Logo = () => {
  const router = useRouter();
  const { toggle } = useSidebar();

  const handleClick = useCallback(() => {
    router.push("/");
    toggle();
  }, [router, toggle]);

  return (
    <div
      className="hover:bg-tertiary-100 flex cursor-pointer items-center justify-center rounded-md p-3 "
      onClick={handleClick}
    >
      <div className="text-primary font-bold">
        <LogoSVG className="h-[3rem] w-[3rem]" />
      </div>
      <span className="text-primary ml-1 text-5xl">at</span>
      <span className="text-secondary text-5xl">Core</span>
    </div>
  );
};
