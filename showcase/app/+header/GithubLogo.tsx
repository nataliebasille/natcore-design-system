"use client";

import { type FC } from "react";
import { Button } from "@nataliebasille/natcore-design-system-react";
import { GithubSVG } from "@nataliebasille/natcore-icons/github";

export const GithubLogo: FC<{ className: string }> = ({ className }) => {
  const navigateToGithub = () => {
    window.open(
      "https://github.com/nataliebasille/natcore-design-system",
      "_blank",
    );
  };

  return (
    <Button color="ghost" className={className} onClick={navigateToGithub}>
      <GithubSVG className="h-full w-full" />
    </Button>
  );
};
