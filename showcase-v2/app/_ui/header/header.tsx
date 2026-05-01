import Image from "next/image";
import { twMerge } from "tailwind-merge";

import { GithubIcon } from "../icons/github";
import { ThemeToggle } from "../theme-toggle";
import { MenuIcon } from "./menu-icon";

type HeaderProps = {
  className?: string;
};

export function Header({ className }: HeaderProps) {
  return (
    <>
      <header
        className={twMerge(
          `col-span-full grid grid-cols-[min-content_1fr_max-content_max-content] items-center gap-1 border-b border-tone-500-surface px-2 py-1 tracking-wider desktop:grid-cols-[1fr_max-content_max-content] desktop:px-6`,
          className,
        )}
      >
        <MenuIcon className="col-start-1 row-start-1 tablet:hidden" />
        <div className="col-start-1 -col-end-1 row-start-1 flex items-center justify-self-center tablet:col-span-1 tablet:justify-self-start">
          <Image src="/logo.svg" alt="Natcore Logo" width={32} height={32} />
          <span className="ml-2 flex items-center gap-2">
            <span className="text-2xl">
              <span className="font-bold text-tone-500-primary">Nat</span>
              <span className="font-normal text-tone-500-secondary">Core</span>
            </span>
            <InProgressTag className="rounded-full max-tablet:hidden" />
          </span>
        </div>
        <ThemeToggle className="-col-start-2 -col-end-2 row-start-1" />
        <button className="-col-start-1 -col-end-1 row-start-1 btn-icon btn-ghost/surface">
          <GithubIcon className="h-[1.5em] w-[1.5em]" />
        </button>
      </header>

      <InProgressTag className="p-2 text-center tablet:hidden" />
    </>
  );
}

function InProgressTag({ className }: { className?: string }) {
  return (
    <span
      className={twMerge(
        "bg-tone-100-accent/80 px-2 py-0.5 text-[0.6rem] font-semibold tracking-widest text-tone-700-accent uppercase ring-1 ring-tone-500-accent",
        className,
      )}
    >
      v2 — In Progress
    </span>
  );
}
