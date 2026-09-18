import { useMemo, useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { publicApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import type { Slot } from "../api/models";
import { useBookingByToken, useMonthSlots, useSettings } from "./hooks";
import MonthCalendar from "./MonthCalendar.tsx";
import TimeSlotList from "./TimeSlotList.tsx";
import { groupSlotsByDay, toDateKey } from "./dateUtils";

export default function ManageBooking({
  token,
  initialAction,
}: {
  token: string;
  /** Pre-selects a mode when arriving via an email's cancel/reschedule
   * link (?manage=token&action=...), skipping the extra "what do you want
   * to do" click. */
  initialAction?: "cancel" | "reschedule";
}): ReactElement {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: booking, isLoading, isError } = useBookingByToken(token);
  const { data: settings } = useSettings();
  const now = useMemo(() => new Date(), []);

  const [mode, setMode] = useState<
    "view" | "cancel" | "reschedule" | "rescheduleSuccess"
  >(initialAction ?? "view");
  const [cancelReason, setCancelReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cancelMutation = useMutation({
    mutationFn: () =>
      publicApi.cancelBookingByClient(token, {
        reason: cancelReason || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", "manage", token] });
      // Cancelling frees the slot back up -- refresh so it shows as
      // available again instead of staying "taken" until staleTime passes.
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      setMode("view");
    },
    onError: (err) =>
      setError(getErrorMessage(err, t("booking.errors.generic"))),
  });

  const rescheduleMutation = useMutation({
    mutationFn: (startAt: string) =>
      publicApi.rescheduleBookingByClient(token, { startAt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", "manage", token] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      setMode("rescheduleSuccess");
    },
    onError: (err) =>
      setError(getErrorMessage(err, t("booking.errors.generic"))),
  });

  const backToHome = () => {
    navigate("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (mode === "rescheduleSuccess") {
    return (
      <div className="text-center">
        <h3 className="serif mb-3 text-[22px] text-ink">
          {t("booking.manage.rescheduleSuccessHeading")}
        </h3>
        <p className="mx-auto mb-6 max-w-[44ch] text-sm text-ink-soft">
          {t("booking.manage.rescheduleSuccessBody")}
        </p>
        <button
          type="button"
          onClick={backToHome}
          className="rounded-full border border-line px-6 py-2.5 text-sm text-ink no-underline transition-colors duration-200 hover:border-accent hover:text-accent"
        >
          {t("booking.manage.backToHome")}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <p className="text-sm text-ink-soft">{t("booking.manage.loading")}</p>
    );
  }

  if (isError || !booking) {
    return (
      <p className="text-sm text-ink-soft">{t("booking.manage.notFound")}</p>
    );
  }

  const formattedStart = new Date(booking.startAt).toLocaleString(
    i18n.language.startsWith("hu") ? "hu-HU" : "en-US",
    { dateStyle: "full", timeStyle: "short" },
  );

  // Mirrors the backend's own notice-window check (BookingsService) so the
  // client sees this upfront instead of picking a new time only to have
  // the submit rejected -- the check is against the CURRENT booking time,
  // not whatever new time they're about to pick, so it can't be worked
  // around by choosing a date further out.
  const hoursUntilStart =
    (new Date(booking.startAt).getTime() - now.getTime()) / (60 * 60 * 1000);
  const pastNoticeWindow = settings
    ? hoursUntilStart < settings.cancellationNoticeHours
    : false;

  return (
    <div>
      <h3 className="serif mb-4 text-[22px] text-ink">
        {t("booking.manage.heading")}
      </h3>

      <div className="mb-6 rounded-xl border border-line bg-bg-card p-5">
        <p className="mb-1 text-ink-soft">{booking.eventType.title}</p>
        <p className="serif text-[19px] text-ink">{formattedStart}</p>
      </div>

      {booking.status === "CANCELLED" ? (
        <p className="text-sm text-ink-soft">
          {t("booking.manage.cancelledLabel")}
        </p>
      ) : pastNoticeWindow ? (
        <p className="text-sm text-ink-soft">
          {t("booking.manage.noticeWindowBlocked", {
            hours: settings!.cancellationNoticeHours,
          })}
        </p>
      ) : (
        <>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          {mode === "view" && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMode("reschedule")}
                className="rounded-full border border-line px-5 py-2 text-sm text-ink hover:border-accent hover:text-accent"
              >
                {t("booking.manage.reschedule")}
              </button>
              <button
                type="button"
                onClick={() => setMode("cancel")}
                className="rounded-full border border-line px-5 py-2 text-sm text-ink hover:border-red-400 hover:text-red-600"
              >
                {t("booking.manage.cancel")}
              </button>
            </div>
          )}

          {mode === "cancel" && (
            <div>
              <label className="mb-3 block text-sm">
                <span className="mb-1.5 block text-[13.5px] text-ink-soft">
                  {t("booking.manage.cancelReasonLabel")}
                </span>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-line bg-bg-card px-4 py-2.5 text-ink"
                />
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode("view")}
                  className="text-sm text-ink-soft hover:text-accent"
                >
                  {t("booking.form.back")}
                </button>
                <button
                  type="button"
                  disabled={cancelMutation.isPending}
                  onClick={() => cancelMutation.mutate()}
                  className="ml-auto rounded-full bg-ink px-6 py-2.5 text-sm text-bg hover:opacity-85 disabled:opacity-50"
                >
                  {t("booking.manage.cancelConfirm")}
                </button>
              </div>
            </div>
          )}

          {mode === "reschedule" && (
            <RescheduleCalendar
              eventTypeId={booking.eventTypeId}
              excludeStartAt={booking.startAt}
              isPending={rescheduleMutation.isPending}
              onBack={() => setMode("view")}
              onSelect={(startAt) => rescheduleMutation.mutate(startAt)}
            />
          )}
        </>
      )}
    </div>
  );
}

function RescheduleCalendar({
  eventTypeId,
  excludeStartAt,
  isPending,
  onSelect,
  onBack,
}: {
  eventTypeId: string;
  excludeStartAt: string;
  isPending: boolean;
  onSelect: (startAt: string) => void;
  onBack: () => void;
}): ReactElement {
  const { t } = useTranslation();
  // Open on the currently booked date, not today -- the client is usually
  // here to nudge the time on the same day, not hunt for a new one.
  const currentStart = useMemo(
    () => new Date(excludeStartAt),
    [excludeStartAt],
  );
  const [viewYear, setViewYear] = useState(currentStart.getFullYear());
  const [viewMonth, setViewMonth] = useState(currentStart.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(currentStart);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const { data: slots, isLoading } = useMonthSlots(
    eventTypeId,
    viewYear,
    viewMonth,
  );
  const slotsByDay = useMemo(
    () => (slots ? groupSlotsByDay(slots) : new Map<string, Slot[]>()),
    [slots],
  );
  const daySlots = selectedDate
    ? (slotsByDay.get(toDateKey(selectedDate)) ?? [])
    : [];

  return (
    <div>
      <p className="mb-3 text-sm text-ink-soft">
        {t("booking.manage.rescheduleIntro")}
      </p>
      <div className="mb-4 grid grid-cols-1 gap-6 sm:grid-cols-[1fr_1fr]">
        <MonthCalendar
          viewYear={viewYear}
          viewMonth={viewMonth}
          slotsByDay={slotsByDay}
          isLoading={isLoading}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setSelectedSlot(null);
          }}
          onPrevMonth={() => {
            const prev = new Date(viewYear, viewMonth - 1, 1);
            setViewYear(prev.getFullYear());
            setViewMonth(prev.getMonth());
          }}
          onNextMonth={() => {
            const next = new Date(viewYear, viewMonth + 1, 1);
            setViewYear(next.getFullYear());
            setViewMonth(next.getMonth());
          }}
        />
        <div>
          {selectedDate ? (
            <TimeSlotList
              slots={daySlots}
              selectedSlot={selectedSlot}
              onSelect={setSelectedSlot}
            />
          ) : (
            <p className="text-sm text-ink-soft">
              {t("booking.calendar.selectDay")}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-ink-soft hover:text-accent"
        >
          {t("booking.form.back")}
        </button>
        <button
          type="button"
          disabled={!selectedSlot || isPending}
          onClick={() => selectedSlot && onSelect(selectedSlot.startAt)}
          className="ml-auto rounded-full bg-ink px-6 py-2.5 text-sm text-bg hover:opacity-85 disabled:opacity-50"
        >
          {t("booking.manage.reschedule")}
        </button>
      </div>
    </div>
  );
}
