import classnames from "classnames";
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

const MutedText = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={classnames(
        "my-4 block tracking-wider text-gray-600",
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
    <div className="flex items-start gap-8 scroll-smooth">
      <article className="w-full flex-1">
        <h1 id={title} className="text-primary-800 dark:text-primary-50">
          {title}
        </h1>

        {description && <MutedText className="mb-7">{description}</MutedText>}

        {childrenWithLevel}
      </article>
      <div className="sticky top-0 mt-6 hidden min-w-fit flex-initial lg:block">
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
    <>
      <div className="relative my-4">
        <CopySectionUrl sectionId={title} />

        <Heading
          id={title}
          className="text-primary-800 dark:text-primary-50 tracking-wider"
        >
          {title}
        </Heading>
      </div>
      {description && <MutedText>{description}</MutedText>}
      {children}
    </>
  );
};
