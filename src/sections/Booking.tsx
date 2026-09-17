import { lazy, Suspense, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import Section from "../components/Section.tsx";
import Container from "../components/Container.tsx";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";

// Code-split: pulls in openapi-fetch, react-phone-number-input, and the rest
// of the booking flow's logic, none of which the vast majority of page loads
// (everyone who doesn't scroll to or interact with this section) ever needs.
const BookingWizard = lazy(() => import("../booking/BookingWizard.tsx"));
const ManageBooking = lazy(() => import("../booking/ManageBooking.tsx"));

export default function Booking(): ReactElement {
  const { t } = useTranslation();
  const { ref, className, isVisible } = useRevealOnScroll<HTMLDivElement>();
  const [searchParams] = useSearchParams();
  const manageToken = searchParams.get("manage");

  return (
    <Section
      id="idopontfoglalas"
      className="border-y border-line bg-bg-panel pt-14 pb-16 xs:pt-20 xs:pb-[90px] xl:pt-[92px] xl:pb-[104px] 2xl:pt-[110px] 2xl:pb-[130px]"
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

        {/* A direct "manage my booking" link (?manage=token, e.g. from an
            email) always mounts immediately -- only the default wizard
            waits for scroll-into-view, since that's the case where deferring
            the ~50KB chunk actually helps someone who never gets here. */}
        {manageToken || isVisible ? (
          <Suspense
            fallback={
              <p className="text-sm text-ink-soft">
                {t("booking.manage.loading")}
              </p>
            }
          >
            {manageToken ? (
              <ManageBooking token={manageToken} />
            ) : (
              <BookingWizard />
            )}
          </Suspense>
        ) : null}
      </Container>
    </Section>
  );
}
