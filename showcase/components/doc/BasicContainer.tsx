import classnames from "classnames";

export const BasicContainer = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={classnames(
        " border-surface-shades-500 bg-surface-shades-200 rounded-lg border p-3",
        className,
      )}
    >
      {children}
    </div>
  );
};
