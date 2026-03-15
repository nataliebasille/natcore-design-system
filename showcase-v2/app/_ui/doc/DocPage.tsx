import { twMerge } from "tailwind-merge";
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
  type JSX,
  type PropsWithChildren,
} from "react";
import { OnThisPage } from "./OnThisPage";
import { CopySectionUrl } from "./CopySectionUrl";

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
        "text-tone-950-surface/60 my-4 block tracking-tight",
        className,
      )}
    >
      {children}
    </span>
  );
};

type SectionTree = {
  title: string;
  children?: SectionTree[];
};

export const DocPage = ({ children, title, description }: DocPageProps) => {
  const childrenWithLevel = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === DocSection) {
      return cloneElement(child as ReactElement<DocSectionProps>, {
        level: 2 as const,
      });
    }

    return child;
  });

  const sectionsTree = Children.toArray(children).flatMap(
    function createSectionTree(child): SectionTree[] {
      if (isValidElement(child) && child.type === DocSection) {
        return [
          {
            title: (child.props as any).title as string,
            children: Children.toArray((child.props as any).children).flatMap(
              createSectionTree,
            ),
          },
        ];
      }

      return [];
    },
  );

  return (
    <div className="divide-tone-600-surface/30 lg:*:not-first:pl-4 lg:*:not-last:pr-4 grid h-full grid-cols-[minmax(0,1fr)_auto] items-start scroll-smooth lg:divide-x">
      <article className="h-full w-full p-6">
        <h1 id={title}>{title}</h1>

        {description && (
          <p className="text-xl">
            <Description>{description}</Description>
          </p>
        )}

        {childrenWithLevel}
      </article>
      <div className="sticky top-0 mt-6 h-full min-w-fit flex-initial max-lg:hidden lg:w-[280px]">
        <OnThisPage tree={sectionsTree} />
      </div>
    </div>
  );
};

type DocSectionProps = DocPageProps & { level?: 1 | 2 | 3 | 4 | 5 | 6 };

export const DocSection = ({
  children,
  title,
  description,
  level = 2,
}: DocSectionProps) => {
  const Heading = `h${level}` as keyof JSX.IntrinsicElements;
  children = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === DocSection) {
      return cloneElement(child as ReactElement<DocSectionProps>, {
        level: (level + 1) as DocSectionProps["level"],
      });
    }

    return child;
  });

  return (
    <div className="card-soft mt-6 mb-8">
      <div className="card-content">
        <div className="relative">
          <CopySectionUrl sectionId={title} />

          <Heading id={title} className="tracking-tighter mt-0!">
            {title}
          </Heading>
        </div>
        {description && <Description>{description}</Description>}

        <div className="flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
};
