"use client";

import { useRouter } from "next/navigation";
import { LogoSVG } from "@nataliebasille/natcore-icons/logo";
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
      className="hover:bg-accent-100 flex cursor-pointer items-center justify-center rounded-md p-3 "
      onClick={handleClick}
    >
      <div className="text-primary-800 font-bold">
        <LogoSVG className="h-[3rem] w-[3rem]" />
      </div>
      <span className="text-primary-800 ml-1 text-5xl">at</span>
      <span className="text-secondary-800 text-5xl">Core</span>
    </div>
  );
};
