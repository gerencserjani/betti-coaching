import { useState, type FormEvent, type ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import type { AvailabilityOverride, WeeklyAvailability } from "../api/models";
import {
  WEEKDAY_LABELS,
  formatDate,
  hhmmToMinutes,
  minutesToHHmm,
} from "./utils";

const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0"),
);

// A plain <input type="time"> renders 12h AM/PM here regardless of a `lang`
// hint on the element -- Chrome derives that format from the browser's own
// language setting, not the page. Two selects sidestep it entirely.
function TimeInput24({
  value,
  onChange,
  bg = "bg-bg",
}: {
  value: string;
  onChange: (value: string) => void;
  bg?: "bg-bg" | "bg-bg-card";
}): ReactElement {
  const [hh, mm] = value.split(":");
  const selectClass = `rounded-lg border border-line ${bg} px-1.5 py-1.5 text-ink`;

  return (
    <div className="flex items-center gap-1">
      <select
        aria-label="Óra"
        value={hh}
        onChange={(e) => onChange(`${e.target.value}:${mm}`)}
        className={selectClass}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="text-ink-soft">:</span>
      <select
        aria-label="Perc"
        value={mm}
        onChange={(e) => onChange(`${hh}:${e.target.value}`)}
        className={selectClass}
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function AvailabilityPage(): ReactElement {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl text-ink">Elérhetőség</h1>
      <WeeklySection />
      <OverridesSection />
    </div>
  );
}

function WeeklySection(): ReactElement {
  const queryClient = useQueryClient();
  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin", "availability", "weekly"],
    queryFn: adminApi.weeklyAvailability,
  });
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [weekday, setWeekday] = useState(1);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin", "availability", "weekly"],
    });

  const createMutation = useMutation({
    mutationFn: adminApi.createWeeklyAvailability,
    onSuccess: () => {
      invalidate();
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      weekday: number;
      startMinute: number;
      endMinute: number;
    }) => adminApi.updateWeeklyAvailability(id, body),
    onSuccess: () => {
      invalidate();
      setError(null);
      setEditingId(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: adminApi.removeWeeklyAvailability,
    onSuccess: invalidate,
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      weekday,
      startMinute: hhmmToMinutes(start),
      endMinute: hhmmToMinutes(end),
    });
  };

  return (
    <section>
      <h2 className="mb-3 text-[15px] font-medium text-ink">
        Heti visszatérő órarend
      </h2>

      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-4 flex flex-wrap items-end gap-2"
      >
        <label className="text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">Nap</span>
          <select
            value={weekday}
            onChange={(e) => setWeekday(Number(e.target.value))}
            className="rounded-lg border border-line bg-bg-card px-2 py-1.5 text-ink"
          >
            {Object.entries(WEEKDAY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">
            Kezdés
          </span>
          <TimeInput24 value={start} onChange={setStart} bg="bg-bg-card" />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">Vége</span>
          <TimeInput24 value={end} onChange={setEnd} bg="bg-bg-card" />
        </label>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-full bg-ink px-4 py-1.5 text-sm text-bg transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
        >
          Hozzáadás
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-ink-soft">Betöltés…</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows
            ?.slice()
            .sort(
              (a, b) => a.weekday - b.weekday || a.startMinute - b.startMinute,
            )
            .map((row) =>
              editingId === row.id ? (
                <EditWeeklyRow
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
                  className="flex items-center justify-between rounded-lg border border-line bg-bg-card px-3 py-2 text-sm"
                >
                  <span>
                    {WEEKDAY_LABELS[row.weekday]}:{" "}
                    {minutesToHHmm(row.startMinute)}
                    {" – "}
                    {minutesToHHmm(row.endMinute)}
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
            <li className="text-sm text-ink-soft">Nincs megadva órarend.</li>
          )}
        </ul>
      )}
    </section>
  );
}

function EditWeeklyRow({
  row,
  isPending,
  onSave,
  onCancel,
}: {
  row: WeeklyAvailability;
  isPending: boolean;
  onSave: (body: {
    weekday: number;
    startMinute: number;
    endMinute: number;
  }) => void;
  onCancel: () => void;
}): ReactElement {
  const [weekday, setWeekday] = useState(row.weekday);
  const [start, setStart] = useState(minutesToHHmm(row.startMinute));
  const [end, setEnd] = useState(minutesToHHmm(row.endMinute));

  return (
    <li className="flex flex-wrap items-end gap-2 rounded-lg border border-accent-soft bg-bg-card px-3 py-2 text-sm">
      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">Nap</span>
        <select
          value={weekday}
          onChange={(e) => setWeekday(Number(e.target.value))}
          className="rounded-lg border border-line bg-bg px-2 py-1.5 text-ink"
        >
          {Object.entries(WEEKDAY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">Kezdés</span>
        <TimeInput24 value={start} onChange={setStart} />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">Vége</span>
        <TimeInput24 value={end} onChange={setEnd} />
      </label>
      <div className="ml-auto flex gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            onSave({
              weekday,
              startMinute: hhmmToMinutes(start),
              endMinute: hhmmToMinutes(end),
            })
          }
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
    createMutation.mutate({
      date,
      isUnavailable,
      ...(isUnavailable
        ? {}
        : { startMinute: hhmmToMinutes(start), endMinute: hhmmToMinutes(end) }),
    });
  };

  return (
    <section>
      <h2 className="mb-3 text-[15px] font-medium text-ink">
        Dátum-kivételek (szabadnap / eltérő órarend)
      </h2>

      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mb-4 flex flex-wrap items-end gap-2"
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
        <ul className="flex flex-col gap-1">
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
                className="flex items-center justify-between rounded-lg border border-line bg-bg-card px-3 py-2 text-sm"
              >
                <span>
                  {formatDate(row.date)}:{" "}
                  {row.isUnavailable
                    ? "szabadnap"
                    : `${minutesToHHmm(row.startMinute!)} – ${minutesToHHmm(row.endMinute!)}`}
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

  return (
    <li className="flex flex-wrap items-end gap-2 rounded-lg border border-accent-soft bg-bg-card px-3 py-2 text-sm">
      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">Dátum</span>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-line bg-bg px-2 py-1.5 text-ink"
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
            <TimeInput24 value={start} onChange={setStart} />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-[13.5px] text-ink-soft">
              Vége
            </span>
            <TimeInput24 value={end} onChange={setEnd} />
          </label>
        </>
      )}
      <div className="ml-auto flex gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            onSave({
              date,
              isUnavailable,
              ...(isUnavailable
                ? {}
                : {
                    startMinute: hhmmToMinutes(start),
                    endMinute: hhmmToMinutes(end),
                  }),
            })
          }
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
