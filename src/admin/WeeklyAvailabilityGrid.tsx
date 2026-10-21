import { useEffect, useRef, useState, type ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import type { WeeklyAvailability } from "../api/models";
import { WEEKDAY_LABELS, hhmmToMinutes, minutesToHHmm } from "./utils";
import { TimePicker } from "./TimePicker";

// Monday-first, matching WEEKDAY_LABELS (1 = Monday ... 7 = Sunday) and the
// public booking calendar's own convention (MonthCalendar.tsx).
const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
const SHORT_LABELS: Record<number, string> = {
  1: "H",
  2: "K",
  3: "Sze",
  4: "Cs",
  5: "P",
  6: "Szo",
  7: "V",
};

/**
 * A Monday-through-Sunday grid, one column per weekday, each showing that
 * day's recurring time blocks as chips -- replaces a flat "Hétfő: 09:00 –
 * 17:00" list with something a coach can actually read her whole week off
 * of at a glance, matching the visual language of the public booking
 * calendar (MonthCalendar.tsx) instead of looking like a bare admin form.
 */
export default function WeeklyAvailabilityGrid(): ReactElement {
  const queryClient = useQueryClient();
  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin", "availability", "weekly"],
    queryFn: adminApi.weeklyAvailability,
  });
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingDay, setAddingDay] = useState<number | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin", "availability", "weekly"],
    });

  const createMutation = useMutation({
    mutationFn: adminApi.createWeeklyAvailability,
    onSuccess: () => {
      invalidate();
      setError(null);
      setAddingDay(null);
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

  const byDay = new Map<number, WeeklyAvailability[]>();
  for (const day of WEEKDAYS) byDay.set(day, []);
  for (const row of rows ?? []) {
    byDay.get(row.weekday)?.push(row);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => a.startMinute - b.startMinute);
  }

  return (
    <section>
      <h2 className="mb-3 text-[15px] font-medium text-ink">
        Heti visszatérő órarend
      </h2>

      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-ink-soft">Betöltés…</p>
      ) : (
        <div className="grid grid-cols-1 items-start gap-1.5 sm:grid-cols-2 sm:gap-2 md:grid-cols-4 lg:grid-cols-7">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="mx-auto flex w-full max-w-xs flex-col gap-1.5 rounded-xl border border-line bg-bg-card p-1.5 sm:gap-2 sm:p-2"
            >
              <div className="serif text-center text-[13px] text-ink-soft">
                <span className="lg:hidden">{WEEKDAY_LABELS[day]}</span>
                <span className="hidden lg:inline" title={WEEKDAY_LABELS[day]}>
                  {SHORT_LABELS[day]}
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {byDay.get(day)!.map((row) =>
                  editingId === row.id ? (
                    <EditChip
                      key={row.id}
                      row={row}
                      isPending={updateMutation.isPending}
                      onCancel={() => setEditingId(null)}
                      onSave={(startMinute, endMinute) =>
                        updateMutation.mutate({
                          id: row.id,
                          weekday: row.weekday,
                          startMinute,
                          endMinute,
                        })
                      }
                    />
                  ) : (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => setEditingId(row.id)}
                      className="group rounded-lg border border-accent-soft bg-bg px-2 py-1 text-xs text-ink transition-colors duration-150 hover:border-accent sm:py-1.5"
                    >
                      <div className="grid grid-cols-[20px_1fr_20px] items-center gap-1">
                        <span aria-hidden="true" />
                        <span className="text-center">
                          {minutesToHHmm(row.startMinute)}
                          {" – "}
                          {minutesToHHmm(row.endMinute)}
                        </span>
                        <span
                          role="button"
                          aria-label="Törlés"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMutation.mutate(row.id);
                          }}
                          className="justify-self-end text-ink-soft opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:text-red-600 dark:hover:text-red-400"
                        >
                          ×
                        </span>
                      </div>
                    </button>
                  ),
                )}
              </div>

              {addingDay === day ? (
                <AddChip
                  isPending={createMutation.isPending}
                  onCancel={() => setAddingDay(null)}
                  onSave={(startMinute, endMinute) =>
                    createMutation.mutate({
                      weekday: day,
                      startMinute,
                      endMinute,
                    })
                  }
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setAddingDay(day)}
                  className="rounded-lg border border-dashed border-line px-2 py-1 text-xs text-ink-soft transition-colors duration-150 hover:border-accent-soft hover:text-accent sm:py-1.5"
                >
                  + Hozzáadás
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Shared by EditChip/AddChip below -- both are "a start time, an end time,
 * Mentés/Mégse" with the exact same labeling and validation, just different
 * initial values and a different border color to tell them apart (editing
 * an existing block vs. adding a new one).
 */
function ChipTimeForm({
  initialStart,
  initialEnd,
  isPending,
  borderClass,
  onSave,
  onCancel,
}: {
  initialStart: string;
  initialEnd: string;
  isPending: boolean;
  borderClass: string;
  onSave: (startMinute: number, endMinute: number) => void;
  onCancel: () => void;
}): ReactElement {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    const startMinute = hhmmToMinutes(start);
    const endMinute = hhmmToMinutes(end);
    // Checked here, not just left to the backend, so this never surfaces
    // the backend's own (English) validation message -- the admin UI is
    // Hungarian throughout.
    if (startMinute >= endMinute) {
      setError("A kezdésnek korábban kell lennie, mint a végének.");
      return;
    }
    setError(null);
    onSave(startMinute, endMinute);
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col gap-1.5 rounded-lg border ${borderClass} bg-bg px-2 py-1.5`}
    >
      <label className="flex flex-col gap-0.5">
        <span className="text-[10px] text-ink-soft">Kezdés</span>
        <TimePicker value={start} onChange={setStart} />
      </label>
      <label className="flex flex-col gap-0.5">
        <span className="text-[10px] text-ink-soft">Vége</span>
        <TimePicker value={end} onChange={setEnd} />
      </label>
      {error && (
        <p className="text-[10px] text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={handleSave}
          className="rounded-full bg-ink px-4 py-1 text-xs text-bg transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
        >
          Mentés
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-ink-soft hover:underline"
        >
          Mégse
        </button>
      </div>
    </div>
  );
}

function EditChip({
  row,
  isPending,
  onSave,
  onCancel,
}: {
  row: WeeklyAvailability;
  isPending: boolean;
  onSave: (startMinute: number, endMinute: number) => void;
  onCancel: () => void;
}): ReactElement {
  return (
    <ChipTimeForm
      initialStart={minutesToHHmm(row.startMinute)}
      initialEnd={minutesToHHmm(row.endMinute)}
      isPending={isPending}
      borderClass="border-accent"
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}

function AddChip({
  isPending,
  onSave,
  onCancel,
}: {
  isPending: boolean;
  onSave: (startMinute: number, endMinute: number) => void;
  onCancel: () => void;
}): ReactElement {
  return (
    <ChipTimeForm
      initialStart="09:00"
      initialEnd="17:00"
      isPending={isPending}
      borderClass="border-accent-soft"
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}
