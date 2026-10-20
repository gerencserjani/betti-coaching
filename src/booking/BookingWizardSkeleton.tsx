import { useEffect, useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import SpinnerIcon from "../components/icons/SpinnerIcon";

const WEEKDAY_LABELS_HU = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
const WEEKDAY_LABELS_EN = ["M", "T", "W", "T", "F", "S", "S"];

// How long to wait before admitting the load is taking a while -- long
// enough that it never shows up during a normal (already-warm) load, short
// enough to reassure a visitor who hit a cold start (see README "Cold
// start" in the backend repo: can take up to ~10-15s).
const EXTENDED_WAIT_MS = 4500;

/**
 * Shown in place of the whole wizard while the initial event-types request
 * is in flight -- this is the one request that can hit a cold backend
 * instance, so it's the one worth a skeleton + reassurance rather than a
 * bare spinner. Mirrors the two-column layout the real wizard renders once
 * data arrives (service list + calendar + time slots), so nothing jumps
 * when the real content replaces it.
 */
export default function BookingWizardSkeleton(): ReactElement {
  const { t, i18n } = useTranslation();
  const [showExtended, setShowExtended] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowExtended(true), EXTENDED_WAIT_MS);
    return () => clearTimeout(timer);
  }, []);

  const monthLabel = new Date().toLocaleDateString(
    i18n.language.startsWith("hu") ? "hu-HU" : "en-US",
    { month: "long", year: "numeric" },
  );
  const weekdayLabels = i18n.language.startsWith("hu")
    ? WEEKDAY_LABELS_HU
    : WEEKDAY_LABELS_EN;

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-6 sm:grid-cols-[280px_1fr]"
      >
        <div className="flex flex-col gap-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-ink-soft/15 h-[66px] shrink-0 animate-pulse rounded-xl border border-line"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_1fr]">
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="h-7 w-7 rounded-full border border-line" />
              <div className="serif text-[17px] text-ink capitalize">
                {monthLabel}
              </div>
              <div className="h-7 w-7 rounded-full border border-line" />
            </div>
            <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-xs text-ink-soft">
              {weekdayLabels.map((label, i) => (
                <div key={i}>{label}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => (
                <div
                  key={i}
                  className="bg-ink-soft/15 aspect-square animate-pulse rounded-lg"
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="bg-ink-soft/15 h-[38px] w-16 animate-pulse rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="bg-bg-card/70 absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center backdrop-blur-[1px]">
        <SpinnerIcon size={28} className="text-accent" />
        <p className="text-sm text-ink-soft">
          {t("booking.loadingEventTypes")}
        </p>
        {showExtended && (
          <p className="text-sm text-ink-soft">
            {t("booking.loadingEventTypesExtended")}
          </p>
        )}
      </div>
    </div>
  );
}
