import { type PropsWithChildren } from "react";

export const Divider = ({ children }: PropsWithChildren) => {
  return <div className="divider">{children}</div>;
};
