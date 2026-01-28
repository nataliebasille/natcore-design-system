import Image from "next/image";
import { twMerge } from "tailwind-merge";

import { GithubIcon } from "./icons/github";
import { ThemeToggle } from "./theme-toggle";

type HeaderProps = {
  className?: string;
};

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={twMerge(
        `border-surface-scale-500 col-span-full flex items-center gap-1 border-b px-6 py-1 tracking-wider ${className}`,
      )}
    >
      <Image src="/logo.svg" alt="Natcore Logo" width={32} height={32} />
      <span className="mr-auto text-2xl">
        <span className="text-primary-scale-500 font-bold">Nat</span>
        <span className="text-secondary-scale-500 font-normal">Core</span>
      </span>

      <ThemeToggle />
      <button className="btn-ghost/surface btn-icon btn-size-sm">
        <GithubIcon className="h-[1.5em] w-[1.5em]" />
      </button>
    </header>
  );
}
