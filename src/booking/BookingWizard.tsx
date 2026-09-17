import { useMemo, useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import type {
  BookingWithRelations,
  LocationType,
  PublicEventType,
  Slot,
} from "../api/models";
import { publicApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import EventTypeSelector from "./EventTypeSelector.tsx";
import LocationSelector from "./LocationSelector.tsx";
import MonthCalendar from "./MonthCalendar.tsx";
import TimeSlotList from "./TimeSlotList.tsx";
import BookingForm, { type BookingFormValues } from "./BookingForm.tsx";
import BookingConfirmation from "./BookingConfirmation.tsx";
import { useEventTypes, useMonthSlots } from "./hooks";
import { groupSlotsByDay, toDateKey } from "./dateUtils";
import { formatPriceHuf } from "./formatPrice";

export default function BookingWizard(): ReactElement {
  const { t, i18n } = useTranslation();
  const today = useMemo(() => new Date(), []);
  const { data: eventTypes, isLoading: eventTypesLoading } = useEventTypes();

  const [eventType, setEventType] = useState<PublicEventType | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [confirmedBooking, setConfirmedBooking] =
    useState<BookingWithRelations | null>(null);

  // Skip the "pick a service" screen entirely when there's only one --
  // clicking through a choice that isn't really a choice isn't good UX.
  const effectiveEventType =
    eventType ?? (eventTypes?.length === 1 ? eventTypes[0] : null);
  const effectiveLocation =
    location ??
    (effectiveEventType?.locations.length === 1
      ? effectiveEventType.locations[0]
      : null);

  const { data: slots, isLoading: slotsLoading } = useMonthSlots(
    effectiveEventType?.id ?? null,
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

  const createBooking = useMutation({
    mutationFn: publicApi.createBooking,
    onSuccess: setConfirmedBooking,
  });

  const handleSelectEventType = (et: PublicEventType) => {
    setEventType(et);
    setLocation(et.locations.length === 1 ? et.locations[0] : null);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleChangeEventType = () => {
    setEventType(null);
    setLocation(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setShowDetails(false);
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    setShowDetails(true);
  };

  const handleSubmitForm = (values: BookingFormValues) => {
    if (!effectiveEventType || !effectiveLocation || !selectedSlot) return;
    createBooking.mutate({
      eventTypeId: effectiveEventType.id,
      startAt: selectedSlot.startAt,
      location: effectiveLocation,
      clientName: values.clientName,
      clientEmail: values.clientEmail,
      clientPhone: values.clientPhone,
      clientNote: values.clientNote || undefined,
      locale: i18n.language.startsWith("hu") ? "hu" : "en",
    });
  };

  const resetWizard = () => {
    setEventType(null);
    setLocation(null);
    setSelectedDate(null);
    setSelectedSlot(null);
    setShowDetails(false);
    setConfirmedBooking(null);
    createBooking.reset();
  };

  if (confirmedBooking) {
    return (
      <BookingConfirmation
        booking={confirmedBooking}
        onNewBooking={resetWizard}
      />
    );
  }

  if (eventTypesLoading) {
    return (
      <p className="text-sm text-ink-soft">{t("booking.loadingEventTypes")}</p>
    );
  }

  if (!eventTypes || eventTypes.length === 0) {
    return <p className="text-sm text-ink-soft">{t("booking.noEventTypes")}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[280px_1fr]">
      <div>
        {effectiveEventType ? (
          <BookingSummary
            eventType={effectiveEventType}
            canChangeEventType={eventTypes.length > 1}
            onChangeEventType={handleChangeEventType}
            location={effectiveLocation}
            onSelectLocation={setLocation}
            selectedSlot={selectedSlot}
            onChangeSlot={showDetails ? () => setShowDetails(false) : undefined}
          />
        ) : (
          <>
            <h3 className="mb-3 text-[15px] font-medium text-ink">
              {t("booking.pickService")}
            </h3>
            <EventTypeSelector
              eventTypes={eventTypes}
              onSelect={handleSelectEventType}
            />
          </>
        )}
      </div>

      <div>
        {showDetails ? (
          <>
            <h3 className="mb-3 text-[15px] font-medium text-ink">
              {t("booking.detailsHeading")}
            </h3>
            <BookingForm
              onSubmit={handleSubmitForm}
              onBack={() => setShowDetails(false)}
              isSubmitting={createBooking.isPending}
              error={
                createBooking.isError
                  ? getErrorMessage(
                      createBooking.error,
                      t("booking.errors.generic"),
                    )
                  : null
              }
            />
          </>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_1fr]">
            <MonthCalendar
              viewYear={viewYear}
              viewMonth={viewMonth}
              slotsByDay={slotsByDay}
              isLoading={slotsLoading}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
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
              disabled={!effectiveEventType}
            />
            <div>
              {!effectiveEventType ? null : !effectiveLocation ? (
                <p className="text-sm text-ink-soft">
                  {t("booking.calendar.selectLocationFirst")}
                </p>
              ) : selectedDate ? (
                <TimeSlotList
                  slots={daySlots}
                  selectedSlot={selectedSlot}
                  onSelect={handleSelectSlot}
                  disabled={!effectiveLocation}
                />
              ) : (
                <p className="text-sm text-ink-soft">
                  {t("booking.calendar.selectDay")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingSummary({
  eventType,
  canChangeEventType,
  onChangeEventType,
  location,
  onSelectLocation,
  selectedSlot,
  onChangeSlot,
}: {
  eventType: PublicEventType;
  canChangeEventType: boolean;
  onChangeEventType: () => void;
  location: LocationType | null;
  onSelectLocation: (location: LocationType) => void;
  selectedSlot: Slot | null;
  onChangeSlot: (() => void) | undefined;
}): ReactElement {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-bg-card p-5 sm:sticky sm:top-24 sm:self-start">
      <div>
        <div className="mb-1 flex items-start justify-between gap-2">
          <div className="serif text-[18px] text-ink">{eventType.title}</div>
          {canChangeEventType && (
            <button
              type="button"
              onClick={onChangeEventType}
              className="shrink-0 text-xs text-accent hover:underline"
            >
              {t("booking.change")}
            </button>
          )}
        </div>
        <div className="text-sm text-ink-soft">
          {eventType.durationMinutes} {t("pricing.minutesUnit")} ·{" "}
          {formatPriceHuf(eventType.price, i18n.language, t("booking.free"))}
        </div>
        {eventType.description && (
          <p className="mt-2 text-sm text-ink-soft">{eventType.description}</p>
        )}
      </div>

      {eventType.locations.length > 1 ? (
        <div>
          <LocationSelector
            locations={eventType.locations}
            selected={location}
            onSelect={onSelectLocation}
          />
        </div>
      ) : (
        <div className="text-sm text-ink-soft">
          {t(`booking.location.${eventType.locations[0]}`)}
        </div>
      )}

      {selectedSlot && (
        <div className="flex items-start justify-between gap-2 border-t border-line pt-4">
          <div className="serif text-[15px] text-ink">
            {new Date(selectedSlot.startAt).toLocaleString(
              i18n.language.startsWith("hu") ? "hu-HU" : "en-US",
              { dateStyle: "medium", timeStyle: "short" },
            )}
          </div>
          {onChangeSlot && (
            <button
              type="button"
              onClick={onChangeSlot}
              className="shrink-0 text-xs text-accent hover:underline"
            >
              {t("booking.change")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
