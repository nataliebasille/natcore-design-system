import { type FC, type PropsWithChildren } from "react";

export const Divider: FC<PropsWithChildren> = ({ children }) => {
  return <div className="divider">{children}</div>;
};
