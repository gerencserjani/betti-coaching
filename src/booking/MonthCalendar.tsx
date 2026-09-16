import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import type { Slot } from "../api/models";
import { isPast, isSameDay, toDateKey } from "./dateUtils";

const WEEKDAY_LABELS_HU = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
const WEEKDAY_LABELS_EN = ["M", "T", "W", "T", "F", "S", "S"];

export default function MonthCalendar({
  viewYear,
  viewMonth,
  slotsByDay,
  isLoading,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: {
  viewYear: number;
  viewMonth: number;
  slotsByDay: Map<string, Slot[]>;
  isLoading: boolean;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}): ReactElement {
  const { t, i18n } = useTranslation();

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(
    i18n.language.startsWith("hu") ? "hu-HU" : "en-US",
    { month: "long", year: "numeric" },
  );

  const weekdayLabels = i18n.language.startsWith("hu")
    ? WEEKDAY_LABELS_HU
    : WEEKDAY_LABELS_EN;

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  // 0=Sunday..6=Saturday -> convert to Monday-first offset
  const leadingBlanks = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, i) => new Date(viewYear, viewMonth, i + 1),
    ),
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label={t("booking.calendar.prevMonth")}
          className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-soft hover:border-accent-soft hover:text-accent"
        >
          ←
        </button>
        <div className="serif text-[17px] text-ink capitalize">
          {monthLabel}
        </div>
        <button
          type="button"
          onClick={onNextMonth}
          aria-label={t("booking.calendar.nextMonth")}
          className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-soft hover:border-accent-soft hover:text-accent"
        >
          →
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-ink-soft">{t("booking.calendar.loading")}</p>
      ) : (
        <>
          <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-xs text-ink-soft">
            {weekdayLabels.map((label, i) => (
              <div key={i}>{label}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={i} />;
              const key = toDateKey(date);
              const hasSlots = (slotsByDay.get(key)?.length ?? 0) > 0;
              const disabled = !hasSlots || isPast(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <button
                  key={i}
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectDate(date)}
                  className={[
                    "aspect-square rounded-lg text-sm transition-colors duration-150",
                    isSelected
                      ? "bg-accent text-bg-card"
                      : disabled
                        ? "text-line"
                        : "border border-transparent text-ink hover:border-accent-soft",
                  ].join(" ")}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          {slotsByDay.size === 0 && (
            <p className="mt-3 text-sm text-ink-soft">
              {t("booking.calendar.noSlotsThisMonth")}
            </p>
          )}
        </>
      )}
    </div>
  );
}
