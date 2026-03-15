import { type PropsWithChildren, type ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export const SpotlightContainer = (
  props: PropsWithChildren<{ title?: ReactNode; className?: string }>,
) => {
  return (
    <div
      className={twMerge(
        "card-outline bg-tone-50 text-on-tone-50",
        props.className,
      )}
    >
      <div className={twMerge("card-content", props.title && "pt-0")}>
        {props.title && (
          <div className="text-on-tone-50/60 pt-2 mb-2 uppercase text-sm tracking-widest font-bold">
            {props.title}
          </div>
        )}
        {props.children}
      </div>
    </div>
  );
};
