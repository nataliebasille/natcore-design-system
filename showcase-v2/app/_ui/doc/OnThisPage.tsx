"use client";

import { useMemo, type ReactNode } from "react";
import classnames from "classnames";

export type RegisteredSection = {
  id: string;
  title: string;
  level: 2 | 3 | 4 | 5 | 6;
};

type SectionTree = RegisteredSection & {
  children?: SectionTree[];
};

export const OnThisPage = ({ sections }: { sections: RegisteredSection[] }) => {
  const tree = useMemo(
    () => buildSectionTree(orderSections(sections)),
    [sections],
  );

  return (
    <>
      <div className="mb-4 text-2xl font-bold">On this page</div>
      <div className="list list-none">{tree.flatMap(createListItems(0))}</div>
    </>
  );
};

function orderSections(sections: RegisteredSection[]) {
  if (typeof document === "undefined") {
    return sections;
  }

  return [...sections].sort((left, right) => {
    const leftNode = document.getElementById(left.id);
    const rightNode = document.getElementById(right.id);

    if (!leftNode || !rightNode) {
      return 0;
    }

    if (leftNode === rightNode) {
      return 0;
    }

    return (
        leftNode.compareDocumentPosition(rightNode) &
          Node.DOCUMENT_POSITION_FOLLOWING
      ) ?
        -1
      : 1;
  });
}

function buildSectionTree(sections: RegisteredSection[]) {
  const root: SectionTree[] = [];
  const stack: SectionTree[] = [];

  for (const section of sections) {
    const node: SectionTree = { ...section };

    while (stack.length > 0 && stack[stack.length - 1]!.level >= node.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      root.push(node);
    } else {
      const parent = stack[stack.length - 1]!;
      parent.children = [...(parent.children ?? []), node];
    }

    stack.push(node);
  }

  return root;
}

function createListItems(index: number) {
  return ({ title, id, children }: SectionTree): ReactNode[] => {
    return [
      <a
        key={id}
        className={classnames("list-item", {
          "pl-4!": index === 1,
          "pl-8!": index === 2,
          "pl-12!": index === 3,
          "pl-14!": index === 4,
        })}
        href={`#${id}`}
        onClick={createScrollHandler(id)}
      >
        {title}
      </a>,
      ...(children?.flatMap(createListItems(index + 1)) ?? []),
    ];
  };
}

function createScrollHandler(id: string) {
  return (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    const behavior =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ?
        "auto"
      : "smooth";

    target.scrollIntoView({
      behavior,
      block: "start",
    });

    window.history.pushState(null, "", `#${id}`);
  };
}
