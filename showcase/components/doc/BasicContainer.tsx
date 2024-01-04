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
        "border-primary-border  rounded-lg border p-3",
        className,
      )}
    >
      {children}
    </div>
  );
};
