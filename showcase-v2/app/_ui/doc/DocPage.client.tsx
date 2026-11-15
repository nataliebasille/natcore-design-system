"use client";

import { twMerge } from "tailwind-merge";
import {
  createContext,
  useContext,
  useMemo,
  type JSX,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { CopySectionUrl } from "./CopySectionUrl";
import { sectionId } from "./doc-outline";

type HeadingLevel = 2 | 3 | 4 | 5 | 6;

type OutlineContextValue = {
  level: HeadingLevel;
  titlePath: string[];
};

type DocSectionProps = PropsWithChildren<{
  title: string;
  className?: string;
  description?: ReactNode;
}>;

const OutlineContext = createContext<OutlineContextValue | null>(null);

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
        "mb-2 block tracking-tight text-surface-950/60",
        className,
      )}
    >
      {children}
    </span>
  );
};

function nextLevel(level: HeadingLevel): HeadingLevel {
  return level === 6 ? 6 : ((level + 1) as HeadingLevel);
}

const ROOT_OUTLINE: OutlineContextValue = { level: 2, titlePath: [] };

/** Starts a page's heading levels at h2. */
export function DocOutlineProvider({ children }: PropsWithChildren) {
  return (
    <OutlineContext.Provider value={ROOT_OUTLINE}>
      {children}
    </OutlineContext.Provider>
  );
}

function useNextLevel(title: string) {
  const context = useContext(OutlineContext);

  if (!context) {
    throw new Error("useNextLevel must be used inside DocOutlineProvider");
  }

  const titlePath = useMemo(
    () => [...context.titlePath, title],
    [context.titlePath, title],
  );
  const id = sectionId(titlePath);
  const level = context.level;
  const Header = `h${level}` as keyof JSX.IntrinsicElements;

  const childContext = useMemo<OutlineContextValue>(
    () => ({ level: nextLevel(level), titlePath }),
    [level, titlePath],
  );

  return {
    Header,
    id,
    childContext,
  };
}

export function DocSection({
  children,
  title,
  description,
  className,
}: DocSectionProps) {
  const { Header, id, childContext } = useNextLevel(title);

  return (
    <div className={twMerge("mt-6 mb-8", className)}>
      <div className="relative">
        <CopySectionUrl sectionId={id} />

        <Header id={id} className="mt-0 scroll-mt-20 tracking-tighter">
          {title}
        </Header>
      </div>

      {description && <Description>{description}</Description>}

      <OutlineContext.Provider value={childContext}>
        <div className="flex flex-col gap-4">{children}</div>
      </OutlineContext.Provider>
    </div>
  );
}
