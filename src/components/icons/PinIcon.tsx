import type { ReactElement } from "react";
import type { IconProps } from "./types";

export default function PinIcon({
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
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 21.5s7-6.6 7-12A7 7 0 0 0 5 9.5c0 5.4 7 12 7 12z" />
      <circle cx="12" cy="9.4" r="2.4" />
    </svg>
  );
}
