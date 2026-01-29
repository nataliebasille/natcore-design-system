"use client";

import { type ReactNode } from "react";
import classnames from "classnames";

export type SectionTree = {
  title: string;
  children?: SectionTree[];
};

export const OnThisPage = ({ tree }: { tree: SectionTree[] }) => {
  return (
    <>
      <div className="mb-4 text-2xl font-bold">On this page</div>
      <div className="list list-none">{tree.flatMap(createListItems(0))}</div>
    </>
  );
};

function createListItems(index: number) {
  return ({ title, children }: SectionTree): ReactNode[] => {
    return [
      <a
        key={title}
        className={classnames("list-item", {
          "pl-4!": index === 1,
          "pl-8!": index === 2,
          "pl-12!": index === 3,
          "pl-14!": index === 4,
        })}
        href={`#${title}`}
      >
        {title}
      </a>,
      ...(children?.flatMap(createListItems(index + 1)) ?? []),
    ];
  };
}
