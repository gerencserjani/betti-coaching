import { useState, type FormEvent, type ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import type { AvailabilityOverride } from "../api/models";
import { formatDate, hhmmToMinutes, minutesToHHmm } from "./utils";
import { TimeInput24 } from "./TimeInput24";
import WeeklyAvailabilityGrid from "./WeeklyAvailabilityGrid";

export default function AvailabilityPage(): ReactElement {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl text-ink">Elérhetőség</h1>
      <WeeklyAvailabilityGrid />
      <OverridesSection />
    </div>
  );
}

function OverridesSection(): ReactElement {
  const queryClient = useQueryClient();
  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin", "availability", "overrides"],
    queryFn: adminApi.overrides,
  });
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [isUnavailable, setIsUnavailable] = useState(true);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin", "availability", "overrides"],
    });

  const createMutation = useMutation({
    mutationFn: adminApi.createOverride,
    onSuccess: () => {
      invalidate();
      setError(null);
      setDate("");
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      date: string;
      isUnavailable: boolean;
      startMinute?: number;
      endMinute?: number;
    }) => adminApi.updateOverride(id, body),
    onSuccess: () => {
      invalidate();
      setError(null);
      setEditingId(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: adminApi.removeOverride,
    onSuccess: invalidate,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Checked here, not just left to the backend, so this never surfaces
    // the backend's own (English) validation message -- the admin UI is
    // Hungarian throughout, see TimeInput24's own comment.
    if (!isUnavailable && hhmmToMinutes(start) >= hhmmToMinutes(end)) {
      setError("A kezdésnek korábban kell lennie, mint a végének.");
      return;
    }
    setError(null);
    createMutation.mutate({
      date,
      isUnavailable,
      ...(isUnavailable
        ? {}
        : { startMinute: hhmmToMinutes(start), endMinute: hhmmToMinutes(end) }),
    });
  };

  return (
    <section className="rounded-xl border border-line bg-bg-card p-4">
      <h2 className="mb-1 text-[15px] font-medium text-ink">Dátum-kivételek</h2>
      <p className="mb-3 text-xs text-ink-soft">
        Egy adott napra: szabadnap, vagy a heti órarendtől eltérő elérhetőség.
      </p>

      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-line bg-bg p-3"
      >
        <label className="text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">
            Dátum
          </span>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-line bg-bg-card px-2 py-1.5 text-ink"
          />
        </label>
        <label className="flex items-center gap-1.5 text-sm text-ink-soft">
          <input
            type="checkbox"
            checked={isUnavailable}
            onChange={(e) => setIsUnavailable(e.target.checked)}
          />
          Egész napos szabadnap
        </label>
        {!isUnavailable && (
          <>
            <label className="text-sm">
              <span className="mb-1.5 block text-[13.5px] text-ink-soft">
                Kezdés
              </span>
              <TimeInput24 value={start} onChange={setStart} bg="bg-bg-card" />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block text-[13.5px] text-ink-soft">
                Vége
              </span>
              <TimeInput24 value={end} onChange={setEnd} bg="bg-bg-card" />
            </label>
          </>
        )}
        <button
          type="submit"
          disabled={createMutation.isPending || !date}
          className="rounded-full bg-ink px-4 py-1.5 text-sm text-bg transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
        >
          Hozzáadás
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-ink-soft">Betöltés…</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {rows?.map((row) =>
            editingId === row.id ? (
              <EditOverrideRow
                key={row.id}
                row={row}
                isPending={updateMutation.isPending}
                onCancel={() => setEditingId(null)}
                onSave={(body) =>
                  updateMutation.mutate({ id: row.id, ...body })
                }
              />
            ) : (
              <li
                key={row.id}
                className="flex items-center justify-between rounded-lg border border-line bg-bg px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="text-ink">{formatDate(row.date)}</span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-xs",
                      row.isUnavailable
                        ? "bg-bg-panel text-ink-soft"
                        : "bg-bg-panel text-accent",
                    ].join(" ")}
                  >
                    {row.isUnavailable
                      ? "szabadnap"
                      : `${minutesToHHmm(row.startMinute!)} – ${minutesToHHmm(row.endMinute!)}`}
                  </span>
                </span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingId(row.id)}
                    className="text-ink-soft hover:text-accent hover:underline"
                  >
                    Szerkesztés
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(row.id)}
                    className="text-red-600 hover:underline dark:text-red-400"
                  >
                    Törlés
                  </button>
                </div>
              </li>
            ),
          )}
          {rows?.length === 0 && (
            <li className="text-sm text-ink-soft">Nincs megadva kivétel.</li>
          )}
        </ul>
      )}
    </section>
  );
}

function EditOverrideRow({
  row,
  isPending,
  onSave,
  onCancel,
}: {
  row: AvailabilityOverride;
  isPending: boolean;
  onSave: (body: {
    date: string;
    isUnavailable: boolean;
    startMinute?: number;
    endMinute?: number;
  }) => void;
  onCancel: () => void;
}): ReactElement {
  const [date, setDate] = useState(row.date.slice(0, 10));
  const [isUnavailable, setIsUnavailable] = useState(row.isUnavailable);
  const [start, setStart] = useState(
    row.startMinute !== null ? minutesToHHmm(row.startMinute) : "09:00",
  );
  const [end, setEnd] = useState(
    row.endMinute !== null ? minutesToHHmm(row.endMinute) : "17:00",
  );
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!isUnavailable && hhmmToMinutes(start) >= hhmmToMinutes(end)) {
      setError("A kezdésnek korábban kell lennie, mint a végének.");
      return;
    }
    setError(null);
    onSave({
      date,
      isUnavailable,
      ...(isUnavailable
        ? {}
        : { startMinute: hhmmToMinutes(start), endMinute: hhmmToMinutes(end) }),
    });
  };

  return (
    <li className="flex flex-wrap items-end gap-2 rounded-lg border border-accent-soft bg-bg px-3 py-2 text-sm">
      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">Dátum</span>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-line bg-bg-card px-2 py-1.5 text-ink"
        />
      </label>
      <label className="flex items-center gap-1.5 text-sm text-ink-soft">
        <input
          type="checkbox"
          checked={isUnavailable}
          onChange={(e) => setIsUnavailable(e.target.checked)}
        />
        Egész napos szabadnap
      </label>
      {!isUnavailable && (
        <>
          <label className="text-sm">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Kezdés
            </span>
            <TimeInput24 value={start} onChange={setStart} bg="bg-bg-card" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Vége
            </span>
            <TimeInput24 value={end} onChange={setEnd} bg="bg-bg-card" />
          </label>
        </>
      )}
      {error && (
        <p className="w-full text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="ml-auto flex gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="rounded-full bg-ink px-4 py-1.5 text-sm text-bg transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
        >
          Mentés
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-ink-soft hover:underline"
        >
          Mégse
        </button>
      </div>
    </li>
  );
}
