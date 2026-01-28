import type { IconifyIcon } from "@iconify-icon/react";

type IconProps = React.SVGProps<SVGSVGElement>;

export function createIcon(icon: IconifyIcon) {
  return (props: IconProps) => (
    <svg
      fill="currentColor"
      viewBox={`${icon.top ?? 0} ${icon.left ?? 0} ${icon.width ?? 16} ${icon.height ?? 16}`}
      dangerouslySetInnerHTML={{ __html: icon.body }}
      {...props}
    />
  );
}
