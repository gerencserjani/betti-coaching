import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import Section from "../components/Section.tsx";
import Container from "../components/Container.tsx";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

export default function Booking(): ReactElement {
  const { t } = useTranslation();
  const { ref, className } = useRevealOnScroll<HTMLDivElement>();

  return (
    <Section
      id="idopontfoglalas"
      className="py-14 xs:py-20 xl:py-[92px] 2xl:py-[120px]"
    >
      <Container>
        <div
          ref={ref}
          className={[
            "rounded-[18px] border border-dashed border-line bg-bg-card px-[22px] py-10 text-center xs:px-9 xs:py-14",
            className,
          ].join(" ")}
        >
          <span className="mb-[18px] inline-block rounded-full border border-accent-soft px-3.5 py-[5px] text-[13px] text-accent">
            {t("booking.badge")}
          </span>
          <h2 className="mb-4 text-[clamp(28px,3.6vw,40px)]">
            {t("booking.heading")}
          </h2>
          <p className="mx-auto max-w-[52ch] text-[17px] text-ink-soft">
            {t("booking.placeholder")}
          </p>
        </div>
      </Container>
    </Section>
  );
}
