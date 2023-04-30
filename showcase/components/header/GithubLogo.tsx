"use client";

import { type FC } from "react";
import { Button } from "@natcore/design-system-react";
import { GithubSVG } from "@natcore/design-system-core";

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
