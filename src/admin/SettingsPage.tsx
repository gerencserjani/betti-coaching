import { useState, type FormEvent, type ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import type { Settings } from "../api/models";
import AddressAutocomplete from "./AddressAutocomplete.tsx";

// A free-text timezone field lets a typo (e.g. "Europe/Budapset") reach the
// backend's @IsTimeZone() validator as a cryptic save error. A fixed list of
// real IANA zone names makes an invalid value impossible to select.
const TIMEZONE_OPTIONS: string[] = (() => {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return ["Europe/Budapest"];
  }
})();

export default function SettingsPage(): ReactElement {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: adminApi.settings,
  });

  return (
    <div>
      <h1 className="mb-4 text-xl text-ink">Beállítások</h1>
      {isLoading || !settings ? (
        <p className="text-sm text-ink-soft">Betöltés…</p>
      ) : (
        <SettingsForm settings={settings} />
      )}
    </div>
  );
}

function SettingsForm({ settings }: { settings: Settings }): ReactElement {
  const queryClient = useQueryClient();
  const [businessAddress, setBusinessAddress] = useState(
    settings.businessAddress,
  );
  const [cancellationNoticeHours, setCancellationNoticeHours] = useState(
    settings.cancellationNoticeHours,
  );
  const [businessTimezone, setBusinessTimezone] = useState(
    settings.businessTimezone,
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const mutation = useMutation({
    mutationFn: adminApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      setError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      businessAddress,
      cancellationNoticeHours,
      businessTimezone,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-md flex-col gap-3 rounded-xl border border-line bg-bg-card p-4"
    >
      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">Cím</span>
        <AddressAutocomplete
          value={businessAddress}
          onChange={setBusinessAddress}
          className="w-full rounded-lg border border-line bg-bg px-2 py-1.5 text-ink"
        />
        <span className="mt-1 block text-xs text-ink-soft">
          Ez jelenik meg a helyszínen tartott foglalások visszaigazoló
          emailjében és naptármeghívójában. Gépelés közben válassz a felajánlott
          címek közül, hogy a Google Naptár biztosan helyesen jelenítse meg a
          helyszínt.
        </span>
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">
          Lemondási/átütemezési határidő (óra)
        </span>
        <input
          type="number"
          min={0}
          max={720}
          value={cancellationNoticeHours}
          onChange={(e) => setCancellationNoticeHours(Number(e.target.value))}
          className="w-32 rounded-lg border border-line bg-bg px-2 py-1.5 text-ink"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">
          Időzóna
        </span>
        <select
          value={businessTimezone}
          onChange={(e) => setBusinessTimezone(e.target.value)}
          className="w-full rounded-lg border border-line bg-bg px-2 py-1.5 text-ink"
        >
          {!TIMEZONE_OPTIONS.includes(businessTimezone) && (
            <option value={businessTimezone}>{businessTimezone}</option>
          )}
          {TIMEZONE_OPTIONS.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">
          Mentve.
        </p>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="self-start rounded-full bg-ink px-4 py-1.5 text-sm text-bg transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
      >
        Mentés
      </button>
    </form>
  );
}
