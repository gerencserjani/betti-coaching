import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import Section from "../components/Section.tsx";
import Container from "../components/Container.tsx";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import { communityCtaHref } from "../content/community";
import communityArt from "../assets/community-art.webp";
import communityArtSmall from "../assets/community-art-520w.webp";

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
          <img
            src={communityArt}
            srcSet={`${communityArtSmall} 520w, ${communityArt} 700w`}
            sizes="(min-width: 860px) 420px, 260px"
            alt=""
            aria-hidden="true"
            width={700}
            height={700}
            loading="lazy"
            decoding="async"
            className="order-first mx-auto w-full max-w-[260px] transition-[filter] duration-200 lg:order-none lg:max-w-[420px] dark:[filter:invert(1)_hue-rotate(180deg)_brightness(1.15)_contrast(0.92)]"
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
