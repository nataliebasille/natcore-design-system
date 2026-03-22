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
        "my-4 block tracking-tight text-tone-950-surface/60",
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
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start divide-tone-600-surface/30 scroll-smooth desktop:divide-x desktop:*:not-first:pl-4 desktop:*:not-last:pr-4">
      <article className="h-full w-full desktop:p-6">
        <h1 id={title}>{title}</h1>

        {description && (
          <p className="text-xl">
            <Description>{description}</Description>
          </p>
        )}

        {childrenWithLevel}
      </article>
      <div className="sticky top-6 mt-6 min-w-fit flex-initial max-desktop:hidden desktop:w-[280px]">
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
    <div className="mt-6 mb-8 card-soft">
      <div className="card-content">
        <div className="relative">
          <CopySectionUrl sectionId={title} />

          <Heading id={title} className="mt-0! scroll-mt-20 tracking-tighter">
            {title}
          </Heading>
        </div>

        {description && <Description>{description}</Description>}

        <div className="flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
};
