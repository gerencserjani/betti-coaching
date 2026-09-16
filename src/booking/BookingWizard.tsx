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
import { useMonthSlots } from "./hooks";
import { groupSlotsByDay, toDateKey } from "./dateUtils";

type WizardStep = "eventType" | "location" | "slot" | "details";

export default function BookingWizard(): ReactElement {
  const { t, i18n } = useTranslation();
  const today = useMemo(() => new Date(), []);

  const [step, setStep] = useState<WizardStep>("eventType");
  const [eventType, setEventType] = useState<PublicEventType | null>(null);
  const [location, setLocation] = useState<LocationType | null>(null);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [confirmedBooking, setConfirmedBooking] =
    useState<BookingWithRelations | null>(null);

  const { data: slots, isLoading: slotsLoading } = useMonthSlots(
    eventType?.id ?? null,
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
    if (et.locations.length === 1) {
      setLocation(et.locations[0]);
      setStep("slot");
    } else {
      setStep("location");
    }
  };

  const handleSelectLocation = (loc: LocationType) => {
    setLocation(loc);
    setStep("slot");
  };

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    setStep("details");
  };

  const handleSubmitForm = (values: BookingFormValues) => {
    if (!eventType || !location || !selectedSlot) return;
    createBooking.mutate({
      eventTypeId: eventType.id,
      startAt: selectedSlot.startAt,
      location,
      clientName: values.clientName,
      clientEmail: values.clientEmail,
      clientPhone: values.clientPhone,
      clientNote: values.clientNote || undefined,
      locale: i18n.language.startsWith("hu") ? "hu" : "en",
    });
  };

  const resetWizard = () => {
    setStep("eventType");
    setEventType(null);
    setLocation(null);
    setSelectedDate(null);
    setSelectedSlot(null);
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-[15px] font-medium text-ink">
          {t("booking.step.eventType")}
        </h3>
        {step === "eventType" ? (
          <EventTypeSelector onSelect={handleSelectEventType} />
        ) : (
          eventType && (
            <SelectedSummary
              label={eventType.title}
              onChange={() => setStep("eventType")}
            />
          )
        )}
      </div>

      {eventType && eventType.locations.length > 1 && (
        <div>
          <h3 className="mb-3 text-[15px] font-medium text-ink">
            {t("booking.step.location")}
          </h3>
          {step === "location" ? (
            <LocationSelector
              locations={eventType.locations}
              onSelect={handleSelectLocation}
            />
          ) : (
            location && (
              <SelectedSummary
                label={t(`booking.location.${location}`)}
                onChange={() => setStep("location")}
              />
            )
          )}
        </div>
      )}

      {(step === "slot" || step === "details") && eventType && location && (
        <div>
          <h3 className="mb-3 text-[15px] font-medium text-ink">
            {t("booking.step.slot")}
          </h3>
          {step === "details" && selectedSlot ? (
            <SelectedSummary
              label={new Date(selectedSlot.startAt).toLocaleString(
                i18n.language.startsWith("hu") ? "hu-HU" : "en-US",
                { dateStyle: "medium", timeStyle: "short" },
              )}
              onChange={() => setStep("slot")}
            />
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
              />
              <div>
                {selectedDate ? (
                  <TimeSlotList
                    slots={daySlots}
                    selectedSlot={selectedSlot}
                    onSelect={handleSelectSlot}
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
      )}

      {step === "details" && (
        <div>
          <h3 className="mb-3 text-[15px] font-medium text-ink">
            {t("booking.step.details")}
          </h3>
          <BookingForm
            onSubmit={handleSubmitForm}
            onBack={() => setStep("slot")}
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
        </div>
      )}
    </div>
  );
}

function SelectedSummary({
  label,
  onChange,
}: {
  label: string;
  onChange: () => void;
}): ReactElement {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between rounded-xl border border-line bg-bg-card px-4 py-3">
      <span className="text-sm text-ink">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className="text-sm text-accent hover:underline"
      >
        {t("booking.form.back")}
      </button>
    </div>
  );
}
