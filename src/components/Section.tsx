import type { PropsWithChildren, ReactElement } from "react";

interface SectionProps extends PropsWithChildren {
  id: string;
  className?: string;
}

export default function Section({
  id,
  children,
  className,
}: SectionProps): ReactElement {
  return (
    <section
      id={id}
      className={["scroll-mt-[92px]", className].filter(Boolean).join(" ")}
    >
      {children}
    </section>
  );
}
