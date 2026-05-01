import { twMerge } from "tailwind-merge";

export function Overline({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        "mb-4 text-xs tracking-[.2em] text-surface-700 uppercase",
        className,
      )}
    >
      {children}
    </div>
  );
}
