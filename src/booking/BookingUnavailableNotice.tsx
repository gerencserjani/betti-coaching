import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { contactInfo } from "../content/contact";

export default function BookingUnavailableNotice(): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-line bg-bg-card p-5 text-sm text-ink-soft">
      <p className="mb-3">{t("booking.errors.unavailable")}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <a
          href={`mailto:${contactInfo.email}`}
          className="text-accent hover:underline"
        >
          {contactInfo.email}
        </a>
        <a href={contactInfo.phoneHref} className="text-accent hover:underline">
          {contactInfo.phoneDisplay}
        </a>
      </div>
    </div>
  );
}
