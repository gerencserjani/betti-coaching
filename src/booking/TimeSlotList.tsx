import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { Slot } from "../api/models";

export default function TimeSlotList({
  slots,
  selectedSlot,
  onSelect,
}: {
  slots: Slot[];
  selectedSlot: Slot | null;
  onSelect: (slot: Slot) => void;
}): ReactElement {
  const { t, i18n } = useTranslation();

  if (slots.length === 0) {
    return (
      <p className="text-sm text-ink-soft">
        {t("booking.calendar.noSlotsThisDay")}
      </p>
    );
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(
      i18n.language.startsWith("hu") ? "hu-HU" : "en-US",
      { hour: "2-digit", minute: "2-digit" },
    );

  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) => {
        const isSelected = selectedSlot?.startAt === slot.startAt;
        return (
          <button
            key={slot.startAt}
            type="button"
            onClick={() => onSelect(slot)}
            className={[
              "serif rounded-full border px-4 py-2 text-[15px] transition-colors duration-150",
              isSelected
                ? "border-accent bg-accent text-bg-card"
                : "border-line text-ink hover:border-accent-soft",
            ].join(" ")}
          >
            {formatTime(slot.startAt)}
          </button>
        );
      })}
    </div>
  );
}
