import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import Section from "../components/Section.tsx";
import Container from "../components/Container.tsx";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import BookingWizard from "../booking/BookingWizard.tsx";
import ManageBooking from "../booking/ManageBooking.tsx";

export default function Booking(): ReactElement {
  const { t } = useTranslation();
  const { ref, className } = useRevealOnScroll<HTMLDivElement>();
  const [searchParams] = useSearchParams();
  const manageToken = searchParams.get("manage");

  return (
    <Section
      id="idopontfoglalas"
      className="py-14 xs:py-20 xl:py-[92px] 2xl:py-[120px]"
    >
      <Container>
        <div
          ref={ref}
          className={[
            "mb-9 max-w-[620px] xs:mb-12 xl:mb-[72px]",
            className,
          ].join(" ")}
        >
          <h2 className="mb-4 text-[clamp(30px,4vw,42px)]">
            {t("booking.heading")}
          </h2>
          <p className="text-[17px] text-ink-soft">{t("booking.intro")}</p>
        </div>

        {manageToken ? (
          <ManageBooking token={manageToken} />
        ) : (
          <BookingWizard />
        )}
      </Container>
    </Section>
  );
}
