import { twMerge } from "tailwind-merge";
import {
  type ReactNode,
  type PropsWithChildren,
} from "react";
import { DocOutlineProvider } from "./DocPage.client";

type DocPageProps = PropsWithChildren<{
  title: string;
  description?: ReactNode;
}>;

const Description = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={twMerge(
        "my-4 block tracking-tight text-tone-950-surface/60",
        className,
      )}
    >
      {children}
    </span>
  );
};

export const DocPage = ({ children, title, description }: DocPageProps) => {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start divide-tone-600-surface/30 scroll-smooth desktop:divide-x desktop:*:not-first:pl-4 desktop:*:not-last:pr-4">
      <DocOutlineProvider>
        <article className="h-full w-full desktop:p-6">
          <h1 id={title}>{title}</h1>

          {description && (
            <p className="text-xl">
              <Description>{description}</Description>
            </p>
          )}

          {children}
        </article>
      </DocOutlineProvider>
    </div>
  );
};
