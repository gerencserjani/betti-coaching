import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import Section from "../components/Section.tsx";
import Container from "../components/Container.tsx";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import { freeCallMinutes, priceRows } from "../content/pricing";

function formatHuf(amount: number, language: string): string {
  const locale = language.startsWith("hu") ? "hu-HU" : "en-US";
  return `${new Intl.NumberFormat(locale).format(amount)} HUF`;
}

export default function Pricing(): ReactElement {
  const { t, i18n } = useTranslation();
  const { ref, className } = useRevealOnScroll<HTMLDivElement>();

  return (
    <Section
      id="arak"
      className="border-y border-line bg-bg-panel pt-14 pb-16 xs:pt-20 xs:pb-[90px] xl:pt-[92px] xl:pb-[104px] 2xl:pt-[110px] 2xl:pb-[130px]"
    >
      <Container>
        <div
          ref={ref}
          className={[
            "grid grid-cols-1 items-start gap-[60px] md:grid-cols-[0.9fr_1.1fr]",
            className,
          ].join(" ")}
        >
          <div className="rounded-[18px] border border-line bg-bg-card px-[22px] py-7 xs:px-7 xs:py-8 xl:px-9 xl:py-10">
            <span className="mb-[18px] inline-block rounded-full border border-accent-soft px-3.5 py-[5px] text-[13px] text-accent">
              {t("pricing.freeCall.badge")}
            </span>
            <h3 className="mb-3.5 text-2xl">{t("pricing.freeCall.heading")}</h3>
            <p className="mb-2.5 text-[15.5px] text-ink-soft">
              {t("pricing.freeCall.text")}
            </p>
            <div className="serif mt-[18px] mb-[22px] text-[26px] text-ink xs:text-[32px]">
              {t("pricing.freeCall.priceLabel")}
              <span className="mt-1 block text-[15px] text-ink-soft">
                {freeCallMinutes} {t("pricing.minutesUnit")}
              </span>
            </div>
          </div>

          <table className="w-full border-collapse text-[15px] xs:text-[16px]">
            <caption className="serif mb-[22px] text-left text-[22px] text-ink">
              {t("pricing.tableCaption")}
            </caption>
            <tbody>
              {priceRows.map((row) => (
                <tr key={row.minutes} className="border-b border-line">
                  <td className="px-1 py-[18px] text-ink-soft">
                    {row.minutes} {t("pricing.minutesUnit")}
                  </td>
                  <td className="serif px-1 py-[18px] text-right text-xl">
                    {formatHuf(row.priceHuf, i18n.language)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}
