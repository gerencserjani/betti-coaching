import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { BookingWithRelations } from "../api/models";

export default function BookingConfirmation({
  booking,
  onNewBooking,
}: {
  booking: BookingWithRelations;
  onNewBooking: () => void;
}): ReactElement {
  const { t, i18n } = useTranslation();

  const formattedStart = new Date(booking.startAt).toLocaleString(
    i18n.language.startsWith("hu") ? "hu-HU" : "en-US",
    { dateStyle: "full", timeStyle: "short" },
  );

  return (
    <div className="text-center">
      <h3 className="serif mb-3 text-[22px] text-ink">
        {t("booking.confirmation.heading")}
      </h3>
      <p className="mb-4 text-ink-soft">{booking.eventType.title}</p>
      <p className="serif mb-4 text-[19px] text-ink">{formattedStart}</p>
      <p className="mx-auto mb-6 max-w-[44ch] text-sm text-ink-soft">
        {t("booking.confirmation.body")}
      </p>
      <button
        type="button"
        onClick={onNewBooking}
        className="rounded-full border border-line px-6 py-2.5 text-sm text-ink no-underline transition-colors duration-200 hover:border-accent hover:text-accent"
      >
        {t("booking.confirmation.newBooking")}
      </button>
    </div>
  );
}
