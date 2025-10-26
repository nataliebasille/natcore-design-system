import { type FC, type ReactNode, type JSX } from "react";
import classnames from "classnames";

type DrawerProps = {
  component?: keyof JSX.IntrinsicElements;
  children?: ReactNode;
  open?: boolean;
  className?: string;
};

export const Drawer: FC<DrawerProps> = ({
  component: Component = "div",
  open = false,
  className,
  children,
}) => {
  return (
    <Component className={classnames("drawer drawer-left", className)}>
      <input className="drawer-toggle" type="checkbox" defaultChecked={open} />
      <div className="drawer-content">{children}</div>
    </Component>
  );
};
