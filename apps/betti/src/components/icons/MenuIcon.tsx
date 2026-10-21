import type { ReactElement } from "react";
import type { IconProps } from "./types";

export default function MenuIcon({
  size = 20,
  ...props
}: IconProps): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      {...props}
    >
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
