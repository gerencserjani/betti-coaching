import type { ReactElement } from "react";
import { Trans, useTranslation } from "react-i18next";
import Section from "../components/Section.tsx";
import Container from "../components/Container.tsx";
import heroArt from "../assets/hero-art.webp";
import heroArtSmall from "../assets/hero-art-560w.webp";

const topics = ["partnership", "communication", "parenting"] as const;

export default function Hero(): ReactElement {
  const { t } = useTranslation();

  return (
    <Section
      id="bemutatkozas"
      className="pt-12 pb-14 xs:pt-16 xs:pb-20 xl:pt-[76px] xl:pb-24 2xl:pt-24 2xl:pb-[120px]"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.1fr_0.8fr]">
          <div>
            <p className="serif mb-[18px] text-[15px] text-accent italic">
              {t("hero.kicker")}
            </p>
            <h1 className="mb-5 text-[clamp(38px,5.4vw,60px)] leading-[1.06]">
              <Trans i18nKey="hero.headline" components={{ br: <br /> }} />
            </h1>
            <p className="mb-[34px] max-w-[40ch] text-[19px] text-ink-soft">
              {t("hero.role")}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-2.5">
              {topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-line bg-bg-card px-4 py-2 text-sm text-ink-soft"
                >
                  {t(`hero.topics.${topic}`)}
                </span>
              ))}
            </div>
          </div>

          <img
            src={heroArt}
            srcSet={`${heroArtSmall} 560w, ${heroArt} 720w`}
            sizes="(min-width: 860px) 500px, 280px"
            alt=""
            aria-hidden="true"
            width={720}
            height={720}
            fetchPriority="high"
            decoding="async"
            className="order-first mx-auto w-full max-w-[280px] transition-[filter] duration-200 lg:order-none lg:max-w-none dark:[filter:invert(1)_hue-rotate(180deg)_brightness(1.15)_contrast(0.92)]"
          />
        </div>
      </Container>
    </Section>
  );
}
