import { twMerge } from "tailwind-merge";
import { type ReactNode, type PropsWithChildren } from "react";
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
        "my-4 block tracking-tight text-surface-950/60",
        className,
      )}
    >
      {children}
    </span>
  );
};

export const DocPage = ({ children, title, description }: DocPageProps) => {
  return (
    <DocOutlineProvider>
      <article className="h-full w-full px-4 desktop:p-6">
        <h1 id={title}>{title}</h1>

        {description && (
          <p className="text-xl">
            <Description>{description}</Description>
          </p>
        )}

        {children}
      </article>
    </DocOutlineProvider>
  );
};
