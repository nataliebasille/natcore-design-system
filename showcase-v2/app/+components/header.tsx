import { GithubSVG } from "@nataliebasille/natcore-icons";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

type HeaderProps = {
  className?: string;
};

export function Header({ className }: HeaderProps) {
  return (
    <header
      className={twMerge(
        `col-span-full flex items-center gap-1 tracking-wider border-b border-500-surface px-6 py-3 text-2xl ${className}`,
      )}
    >
      <Image src="/logo.svg" alt="Natcore Logo" width={32} height={32} />
      <span className="mr-auto">
        <span className="text-500-primary font-bold">Nat</span>
        <span className="text-500-secondary font-normal">Core</span>
      </span>

      <button className="btn-outline/primary btn-size-sm">
        <GithubSVG className="h-[1em] w-[1em]" />
      </button>
    </header>
  );
}
