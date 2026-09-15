import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import Section from "../components/Section.tsx";
import Container from "../components/Container.tsx";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import { contactInfo } from "../content/contact";

function PinIcon(): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21.5s7-6.6 7-12A7 7 0 0 0 5 9.5c0 5.4 7 12 7 12z" />
      <circle cx="12" cy="9.4" r="2.4" />
    </svg>
  );
}

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
              <div className="serif text-[19px]">{contactInfo.address}</div>
              <div className="mt-2 flex items-center gap-[18px] rounded-2xl border border-line bg-bg-card p-[22px]">
                <span className="h-[46px] w-[46px] shrink-0 text-accent">
                  <PinIcon />
                </span>
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
