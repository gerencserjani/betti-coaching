import { useState, type FormEvent, type ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import {
  WEEKDAY_LABELS,
  formatDate,
  hhmmToMinutes,
  minutesToHHmm,
} from "./utils";

export default function AvailabilityPage(): ReactElement {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-lg font-semibold">Elérhetőség</h1>
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
  const [weekday, setWeekday] = useState(1);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  const createMutation = useMutation({
    mutationFn: adminApi.createWeeklyAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "availability", "weekly"],
      });
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: adminApi.removeWeeklyAvailability,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "availability", "weekly"],
      }),
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
      <h2 className="mb-3 text-sm font-semibold text-gray-700">
        Heti visszatérő órarend
      </h2>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="mb-4 flex flex-wrap items-end gap-2"
      >
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">Nap</span>
          <select
            value={weekday}
            onChange={(e) => setWeekday(Number(e.target.value))}
            className="rounded border border-gray-300 px-2 py-1.5"
          >
            {Object.entries(WEEKDAY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">Kezdés</span>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">Vége</span>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5"
          />
        </label>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Hozzáadás
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-500">Betöltés…</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows
            ?.slice()
            .sort(
              (a, b) => a.weekday - b.weekday || a.startMinute - b.startMinute,
            )
            .map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-sm"
              >
                <span>
                  {WEEKDAY_LABELS[row.weekday]}:{" "}
                  {minutesToHHmm(row.startMinute)}
                  {" – "}
                  {minutesToHHmm(row.endMinute)}
                </span>
                <button
                  type="button"
                  onClick={() => removeMutation.mutate(row.id)}
                  className="text-red-600 hover:underline"
                >
                  Törlés
                </button>
              </li>
            ))}
          {rows?.length === 0 && (
            <li className="text-sm text-gray-400">Nincs megadva órarend.</li>
          )}
        </ul>
      )}
    </section>
  );
}

function OverridesSection(): ReactElement {
  const queryClient = useQueryClient();
  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin", "availability", "overrides"],
    queryFn: adminApi.overrides,
  });
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [isUnavailable, setIsUnavailable] = useState(true);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");

  const createMutation = useMutation({
    mutationFn: adminApi.createOverride,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "availability", "overrides"],
      });
      setError(null);
      setDate("");
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const removeMutation = useMutation({
    mutationFn: adminApi.removeOverride,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["admin", "availability", "overrides"],
      }),
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
      <h2 className="mb-3 text-sm font-semibold text-gray-700">
        Dátum-kivételek (szabadnap / eltérő órarend)
      </h2>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="mb-4 flex flex-wrap items-end gap-2"
      >
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">Dátum</span>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5"
          />
        </label>
        <label className="flex items-center gap-1.5 text-sm">
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
              <span className="mb-1 block text-gray-600">Kezdés</span>
              <input
                type="time"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1.5"
              />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-gray-600">Vége</span>
              <input
                type="time"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="rounded border border-gray-300 px-2 py-1.5"
              />
            </label>
          </>
        )}
        <button
          type="submit"
          disabled={createMutation.isPending || !date}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Hozzáadás
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-gray-500">Betöltés…</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {rows?.map((row) => (
            <li
              key={row.id}
              className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <span>
                {formatDate(row.date)}:{" "}
                {row.isUnavailable
                  ? "szabadnap"
                  : `${minutesToHHmm(row.startMinute!)} – ${minutesToHHmm(row.endMinute!)}`}
              </span>
              <button
                type="button"
                onClick={() => removeMutation.mutate(row.id)}
                className="text-red-600 hover:underline"
              >
                Törlés
              </button>
            </li>
          ))}
          {rows?.length === 0 && (
            <li className="text-sm text-gray-400">Nincs megadva kivétel.</li>
          )}
        </ul>
      )}
    </section>
  );
}
