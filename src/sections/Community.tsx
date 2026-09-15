import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import Section from "../components/Section.tsx";
import Container from "../components/Container.tsx";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import { communityCtaHref } from "../content/community";

export default function Community(): ReactElement {
  const { t } = useTranslation();
  const { ref, className } = useRevealOnScroll<HTMLDivElement>();

  const ctaClassName =
    "inline-block rounded-full bg-ink px-7 py-3.5 text-sm text-bg no-underline transition-opacity duration-200 hover:opacity-85";

  return (
    <Section
      id="kozosseg"
      className="py-14 xs:py-20 xl:py-[92px] 2xl:py-[120px]"
    >
      <Container>
        <div
          ref={ref}
          className={[
            "grid grid-cols-1 items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16",
            className,
          ].join(" ")}
        >
          <div
            aria-hidden="true"
            className="order-first mx-auto aspect-square w-full max-w-[260px] rounded-full border border-dashed border-line bg-bg-panel lg:order-none lg:max-w-[420px]"
          />

          <div>
            <p className="serif mb-[18px] text-[15px] text-accent italic">
              {t("community.kicker")}
            </p>
            <h2 className="mb-6 max-w-[18ch] text-[clamp(28px,3.6vw,40px)] leading-[1.2]">
              {t("community.heading")}
            </h2>
            <p className="mb-7 max-w-[46ch] text-[17px] text-ink-soft">
              {t("community.body")}
            </p>
            {communityCtaHref ? (
              <a href={communityCtaHref} className={ctaClassName}>
                {t("community.cta")}
              </a>
            ) : (
              <span className={ctaClassName}>{t("community.cta")}</span>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
