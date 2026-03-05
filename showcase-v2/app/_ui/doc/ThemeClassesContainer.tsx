import { type ThemeClass } from "@/utlls/generate-theme-info";
import { BasicContainer } from "./BasicContainer";
import classnames from "classnames";
import { Fragment } from "react";

export const ThemeClassesContainer = ({ theme }: { theme: ThemeClass[] }) => {
  return (
    <BasicContainer className="grid w-full max-w-2xl grid-cols-[1fr_max-content] items-center gap-3 sm:grid-cols-[max-content_max-content_1fr]">
      {Object.entries(theme).map(([key, value]) => (
        <Fragment key={key}>
          <div className="font-bold">.{value.className}</div>
          <div
            className={classnames(
              "flex items-center justify-center rounded-full px-2 text-sm",
              {
                "bg-tone-500-primary text-on-tone-500-primary":
                  value.type === "component",
                "text-tone-700-primary border-tone-700-primary border":
                  value.type === "modifier",
              },
            )}
          >
            {value.type}
          </div>
          <div className="text-tone-600-surface col-span-2 -mt-2 text-sm sm:col-span-1 sm:mt-0 sm:text-base">
            {value.description}
          </div>
        </Fragment>
      ))}
    </BasicContainer>
  );
};
