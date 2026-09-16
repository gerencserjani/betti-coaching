import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { PublicEventType } from "../api/models";

export default function EventTypeSelector({
  eventTypes,
  onSelect,
}: {
  eventTypes: PublicEventType[];
  onSelect: (eventType: PublicEventType) => void;
}): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2.5">
      {eventTypes.map((eventType) => (
        <button
          key={eventType.id}
          type="button"
          onClick={() => onSelect(eventType)}
          className="rounded-xl border border-line bg-bg-card px-5 py-4 text-left transition-colors duration-200 hover:border-accent-soft"
        >
          <div className="flex items-baseline justify-between gap-3">
            <div className="serif text-[17px] text-ink">{eventType.title}</div>
            <div className="shrink-0 text-sm whitespace-nowrap text-ink-soft">
              {eventType.durationMinutes} {t("pricing.minutesUnit")}
            </div>
          </div>
          {eventType.description && (
            <p className="mt-1 text-sm text-ink-soft">
              {eventType.description}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}
