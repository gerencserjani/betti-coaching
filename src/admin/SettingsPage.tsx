import { useState, type FormEvent, type ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import type { Settings } from "../api/models";

export default function SettingsPage(): ReactElement {
  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: adminApi.settings,
  });

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Beállítások</h1>
      {isLoading || !settings ? (
        <p className="text-sm text-gray-500">Betöltés…</p>
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
      className="flex max-w-md flex-col gap-3 rounded border border-gray-200 bg-white p-4"
    >
      <label className="text-sm">
        <span className="mb-1 block text-gray-600">Cím</span>
        <input
          value={businessAddress}
          onChange={(e) => setBusinessAddress(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1.5"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-gray-600">
          Lemondási/átütemezési határidő (óra)
        </span>
        <input
          type="number"
          min={0}
          max={720}
          value={cancellationNoticeHours}
          onChange={(e) => setCancellationNoticeHours(Number(e.target.value))}
          className="w-32 rounded border border-gray-300 px-2 py-1.5"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-gray-600">Időzóna</span>
        <input
          value={businessTimezone}
          onChange={(e) => setBusinessTimezone(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1.5"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-700">Mentve.</p>}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="self-start rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
      >
        Mentés
      </button>
    </form>
  );
}
