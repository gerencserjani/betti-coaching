import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { PublicEventType } from "../api/models";
import { formatHuf, getPriceHuf } from "./priceLookup";

export default function EventTypeSelector({
  eventTypes,
  onSelect,
}: {
  eventTypes: PublicEventType[];
  onSelect: (eventType: PublicEventType) => void;
}): ReactElement {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-col gap-2 sm:max-w-[280px]">
      {eventTypes.map((eventType) => {
        const priceHuf = getPriceHuf(eventType.durationMinutes);
        return (
          <button
            key={eventType.id}
            type="button"
            onClick={() => onSelect(eventType)}
            className="rounded-xl border border-line bg-bg-card px-4 py-3 text-left transition-colors duration-200 hover:border-accent-soft"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="serif text-[16px] text-ink">
                {eventType.title}
              </div>
              {priceHuf !== undefined && (
                <div className="serif shrink-0 text-[15px] text-ink">
                  {formatHuf(priceHuf, i18n.language)}
                </div>
              )}
            </div>
            <div className="text-sm text-ink-soft">
              {eventType.durationMinutes} {t("pricing.minutesUnit")}
            </div>
          </button>
        );
      })}
    </div>
  );
}
