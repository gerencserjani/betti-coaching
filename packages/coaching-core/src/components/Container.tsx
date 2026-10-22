import type { PropsWithChildren, ReactElement } from "react";

interface ContainerProps extends PropsWithChildren {
  className?: string;
}

export default function Container({
  children,
  className,
}: ContainerProps): ReactElement {
  return (
    <div
      className={["mx-auto max-w-[1120px] px-[18px] xs:px-6 xl:px-8", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
