"use client";

import { type FC } from "react";
import { Button } from "@nataliebasille/natcore-design-system-react";
import { GithubSVG } from "@nataliebasille/natcore-icons/github";
import { twMerge } from "tailwind-merge";

export const GithubLogo: FC<{ className: string }> = ({ className }) => {
  const navigateToGithub = () => {
    window.open(
      "https://github.com/nataliebasille/natcore-design-system",
      "_blank",
    );
  };

  return (
    <button
      className={twMerge("btn-outline/secondary", className)}
      onClick={navigateToGithub}
    >
      <GithubSVG className="h-full w-full" />
    </button>
  );
};
