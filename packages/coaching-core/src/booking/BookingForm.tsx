import { useState, type FormEvent, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
// Use the "min" metadata build: much smaller bundle, still validates
// international phone number formats correctly -- we don't need the full
// build's extra carrier/line-type detection.
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input/min";
import "react-phone-number-input/style.css";

export interface BookingFormValues {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientNote: string;
}

export default function BookingForm({
  onSubmit,
  onBack,
  isSubmitting,
  error,
}: {
  onSubmit: (values: BookingFormValues) => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}): ReactElement {
  const { t } = useTranslation();
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState<string>();
  const [clientNote, setClientNote] = useState("");

  const isPhoneValid = !!clientPhone && isValidPhoneNumber(clientPhone);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isPhoneValid || !clientPhone) return;
    onSubmit({ clientName, clientEmail, clientPhone, clientNote });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">
          {t("booking.form.name")}
        </span>
        <input
          required
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg-card px-4 py-2.5 text-ink"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">
          {t("booking.form.email")}
        </span>
        <input
          type="email"
          required
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
          className="w-full rounded-xl border border-line bg-bg-card px-4 py-2.5 text-ink"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">
          {t("booking.form.phone")}
        </span>
        <PhoneInput
          international
          defaultCountry="HU"
          value={clientPhone}
          onChange={setClientPhone}
          className="phone-input rounded-xl border border-line bg-bg-card px-4 py-2.5 text-ink"
        />
        {clientPhone && !isPhoneValid && (
          <span className="mt-1.5 block text-[13px] text-red-600">
            {t("booking.form.phoneInvalid")}
          </span>
        )}
      </label>

      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">
          {t("booking.form.note")}
        </span>
        <textarea
          value={clientNote}
          onChange={(e) => setClientNote(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-line bg-bg-card px-4 py-2.5 text-ink"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-ink-soft hover:text-accent"
        >
          {t("booking.form.back")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isPhoneValid}
          className="ml-auto rounded-full bg-ink px-6 py-2.5 text-sm text-bg no-underline transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
        >
          {isSubmitting
            ? t("booking.form.submitting")
            : t("booking.form.submit")}
        </button>
      </div>
    </form>
  );
}
