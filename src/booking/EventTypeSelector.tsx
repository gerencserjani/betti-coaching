import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { PublicEventType } from "../api/models";
import { formatPriceHuf } from "./formatPrice";

export default function EventTypeSelector({
  eventTypes,
  onSelect,
}: {
  eventTypes: PublicEventType[];
  onSelect: (eventType: PublicEventType) => void;
}): ReactElement {
  const { t, i18n } = useTranslation();
  const isScrollable = eventTypes.length > 6;

  return (
    <div className="relative">
      <div
        className={[
          "flex flex-col gap-2",
          isScrollable ? "max-h-96 overflow-y-auto pr-1" : "",
        ].join(" ")}
      >
        {eventTypes.map((eventType) => (
          <button
            key={eventType.id}
            type="button"
            onClick={() => onSelect(eventType)}
            className="shrink-0 rounded-xl border border-line bg-bg-card px-4 py-3 text-left transition-colors duration-200 hover:border-accent-soft"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="serif min-w-0 break-words text-[16px] text-ink">
                {eventType.title}
              </div>
              <div className="serif shrink-0 text-[15px] text-ink">
                {formatPriceHuf(
                  eventType.price,
                  i18n.language,
                  t("booking.free"),
                )}
              </div>
            </div>
            <div className="text-sm text-ink-soft">
              {eventType.durationMinutes} {t("pricing.minutesUnit")}
            </div>
          </button>
        ))}
      </div>
      {isScrollable && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-bg-panel to-transparent" />
      )}
    </div>
  );
}
