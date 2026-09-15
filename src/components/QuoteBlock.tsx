import type { ReactElement } from "react";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

interface QuoteBlockProps {
  quote: string;
  leadIn: string;
}

export default function QuoteBlock({
  quote,
  leadIn,
}: QuoteBlockProps): ReactElement {
  const { ref, className } = useRevealOnScroll<HTMLDivElement>();

  return (
    <section className="border-y border-line bg-bg-panel py-12 xs:py-16 xl:py-[72px] 2xl:py-[90px]">
      <div
        ref={ref}
        className={[
          "mx-auto max-w-[780px] px-[18px] text-center xs:px-6 xl:px-8",
          className,
        ].join(" ")}
      >
        <p className="serif text-[clamp(22px,3vw,30px)] leading-[1.5] text-ink italic">
          {quote}
        </p>
        <p className="mx-auto mt-[28px] max-w-[640px] text-base text-ink-soft">
          {leadIn}
        </p>
      </div>
    </section>
  );
}
