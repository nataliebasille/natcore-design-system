import { type ThemeClass } from "@/utlls/generate-theme-info";
import { BasicContainer } from "./BasicContainer";
import classnames from "classnames";
import { Fragment } from "react";

export const ThemeClassesContainer = ({ theme }: { theme: ThemeClass[] }) => {
  return (
    <BasicContainer className="grid grid-cols-[max-content_max-content] gap-3 sm:grid-cols-[max-content_max-content_1fr]">
      {Object.entries(theme).map(([key, value]) => (
        <Fragment key={key}>
          <div className="font-bold">.{value.className}</div>
          <div
            className={classnames(
              "flex items-center justify-center rounded-full px-2 text-sm",
              {
                "bg-secondary": value.type === "component",
                "text-secondary-shades-700 border-secondary-shades-700 border":
                  value.type === "modifier",
              },
            )}
          >
            {value.type}
          </div>
          <div className="col-span-2 text-slate-600 sm:col-span-1">
            {value.description}
          </div>
        </Fragment>
      ))}
    </BasicContainer>
  );
};