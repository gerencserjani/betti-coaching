import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import Section from "../components/Section.tsx";
import Container from "../components/Container.tsx";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import { contactInfo } from "../content/contact";
import PinIcon from "../components/icons/PinIcon";

const linkClassName =
  "border-b border-line text-ink no-underline transition-colors duration-200 hover:border-accent hover:text-accent";

export default function Contact(): ReactElement {
  const { t } = useTranslation();
  const { ref, className } = useRevealOnScroll<HTMLDivElement>();

  return (
    <Section
      id="kapcsolat"
      className="pt-16 pb-14 xs:pt-[90px] xs:pb-[72px] xl:pt-[100px] xl:pb-20 2xl:pt-[130px] 2xl:pb-[100px]"
    >
      <Container>
        <div
          ref={ref}
          className={[
            "grid grid-cols-1 gap-[60px] sm:grid-cols-2",
            className,
          ].join(" ")}
        >
          <div>
            <h2 className="mb-5 max-w-[14ch] text-[clamp(30px,4vw,44px)]">
              {t("contact.heading")}
            </h2>
            <p className="max-w-[44ch] text-ink-soft">{t("contact.intro")}</p>
          </div>

          <div className="flex flex-col gap-[26px]">
            <div>
              <div className="mb-1.5 text-[13.5px] text-ink-soft">
                {t("contact.labels.address")}
              </div>
              <div className="flex items-center gap-[18px] rounded-2xl border border-line bg-bg-card p-[22px]">
                <PinIcon size={46} className="shrink-0 text-accent" />
                <div className="flex-1">
                  <div className="serif mb-1 text-[16.5px] text-ink">
                    {contactInfo.street}
                  </div>
                  <a
                    href={contactInfo.mapsUrl}
                    target="_blank"
                    rel="noopener"
                    className="border-b border-accent-soft text-sm text-accent no-underline hover:border-accent"
                  >
                    {t("contact.mapLink")}
                  </a>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-[13.5px] text-ink-soft">
                {t("contact.labels.phone")}
              </div>
              <div className="serif text-[19px]">
                <a href={contactInfo.phoneHref} className={linkClassName}>
                  {contactInfo.phoneDisplay}
                </a>
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-[13.5px] text-ink-soft">
                {t("contact.labels.email")}
              </div>
              <div className="serif text-[19px]">
                <a
                  href={`mailto:${contactInfo.email}`}
                  className={linkClassName}
                >
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
