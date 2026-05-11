"use client";

import { twMerge } from "tailwind-merge";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type JSX,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import { CopySectionUrl } from "./CopySectionUrl";
import { OnThisPage, type RegisteredSection } from "./OnThisPage";

type HeadingLevel = 2 | 3 | 4 | 5 | 6;

type OutlineContextValue = {
  level: HeadingLevel;
  titlePath: string[];
  registerSection: (section: RegisteredSection) => void;
  unregisterSection: (id: string) => void;
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function createSectionId(titlePath: string[]) {
  const slugs = titlePath
    .map((title) => slugify(title) || "section")
    .filter(Boolean);

  return slugs.join("--");
}

export function DocOutlineProvider({ children }: PropsWithChildren) {
  const [sections, setSections] = useState<RegisteredSection[]>([]);

  const registerSection = useCallback((section: RegisteredSection) => {
    setSections((current) => {
      const existingIndex = current.findIndex((item) => item.id === section.id);

      if (existingIndex === -1) {
        return [...current, section];
      }

      const next = current.slice();
      next[existingIndex] = section;
      return next;
    });
  }, []);

  const unregisterSection = useCallback((id: string) => {
    setSections((current) => current.filter((item) => item.id !== id));
  }, []);

  const contextValue = useMemo<OutlineContextValue>(
    () => ({
      level: 2,
      titlePath: [],
      registerSection,
      unregisterSection,
    }),
    [registerSection, unregisterSection],
  );

  return (
    <OutlineContext.Provider value={contextValue}>
      {children}

      <div className="sticky top-6 mt-6 min-w-fit flex-initial max-desktop:hidden desktop:w-[280px]">
        <OnThisPage sections={sections} />
      </div>
    </OutlineContext.Provider>
  );
}

export function useNextLevel(title: string) {
  const context = useContext(OutlineContext);

  if (!context) {
    throw new Error("useNextLevel must be used inside DocOutlineProvider");
  }

  const titlePath = useMemo(
    () => [...context.titlePath, title],
    [context.titlePath, title],
  );
  const id = createSectionId(titlePath);
  const level = context.level;
  const Header = `h${level}` as keyof JSX.IntrinsicElements;

  useEffect(() => {
    context.registerSection({ id, title, level });

    return () => {
      context.unregisterSection(id);
    };
  }, [context, id, level, title]);

  const childContext = useMemo<OutlineContextValue>(
    () => ({
      level: nextLevel(level),
      titlePath,
      registerSection: context.registerSection,
      unregisterSection: context.unregisterSection,
    }),
    [context.registerSection, context.unregisterSection, level, titlePath],
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

        <Header id={id} className="mt-0! scroll-mt-20 tracking-tighter">
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
