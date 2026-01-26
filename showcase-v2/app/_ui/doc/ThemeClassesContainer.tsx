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
                "bg-primary-scale-500 text-primary-contrast-scale-500":
                  value.type === "component",
                "text-primary-scale-700 border-primary-scale-700 border":
                  value.type === "modifier",
              },
            )}
          >
            {value.type}
          </div>
          <div className="text-slate-scale-600 col-span-2 -mt-2 text-sm sm:col-span-1 sm:mt-0 sm:text-base">
            {value.description}
          </div>
        </Fragment>
      ))}
    </BasicContainer>
  );
};
