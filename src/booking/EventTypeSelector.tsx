import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { PublicEventType } from "../api/models";
import { useEventTypes } from "./hooks";

export default function EventTypeSelector({
  onSelect,
}: {
  onSelect: (eventType: PublicEventType) => void;
}): ReactElement {
  const { t } = useTranslation();
  const { data: eventTypes, isLoading } = useEventTypes();

  if (isLoading) {
    return (
      <p className="text-sm text-ink-soft">{t("booking.loadingEventTypes")}</p>
    );
  }

  if (!eventTypes || eventTypes.length === 0) {
    return <p className="text-sm text-ink-soft">{t("booking.noEventTypes")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {eventTypes.map((eventType) => (
        <button
          key={eventType.id}
          type="button"
          onClick={() => onSelect(eventType)}
          className="rounded-2xl border border-line bg-bg-card p-5 text-left transition-colors duration-200 hover:border-accent-soft"
        >
          <div className="serif mb-1 text-[19px] text-ink">
            {eventType.title}
          </div>
          <div className="mb-2 text-sm text-ink-soft">
            {eventType.durationMinutes} {t("pricing.minutesUnit")}
          </div>
          {eventType.description && (
            <p className="text-sm text-ink-soft">{eventType.description}</p>
          )}
        </button>
      ))}
    </div>
  );
}
