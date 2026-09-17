import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import type { EventType, LocationType } from "../api/models";
import { LOCATION_LABELS, formatPriceHuf } from "./utils";

const ALL_LOCATIONS: LocationType[] = ["IN_PERSON", "GOOGLE_MEET", "PHONE"];

function reorder<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  const copy = list.slice();
  const [moved] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, moved);
  return copy;
}

export default function EventTypesPage(): ReactElement {
  const queryClient = useQueryClient();
  const { data: eventTypes, isLoading } = useQuery({
    queryKey: ["admin", "event-types"],
    queryFn: adminApi.eventTypesMine,
  });
  const [editing, setEditing] = useState<EventType | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const archiveMutation = useMutation({
    mutationFn: adminApi.archiveEventType,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "event-types"] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const reactivateMutation = useMutation({
    mutationFn: (id: string) =>
      adminApi.updateEventType(id, { isActive: true }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "event-types"] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteEventType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "event-types"] });
      setDeletingId(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await Promise.all(
        orderedIds.map((id, index) =>
          adminApi.updateEventType(id, { position: index }),
        ),
      );
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "event-types"] }),
    onError: (err) => setError(getErrorMessage(err)),
  });

  const baseList = useMemo(() => eventTypes ?? [], [eventTypes]);
  const displayedList = useMemo(() => {
    if (!draggedId || !overId || draggedId === overId) return baseList;
    const fromIndex = baseList.findIndex((et) => et.id === draggedId);
    const toIndex = baseList.findIndex((et) => et.id === overId);
    if (fromIndex === -1 || toIndex === -1) return baseList;
    return reorder(baseList, fromIndex, toIndex);
  }, [baseList, draggedId, overId]);

  const handleDrop = () => {
    if (draggedId && overId && draggedId !== overId) {
      reorderMutation.mutate(displayedList.map((et) => et.id));
    }
    setDraggedId(null);
    setOverId(null);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl text-ink">Szolgáltatások</h1>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="rounded-full bg-ink px-4 py-1.5 text-sm text-bg transition-opacity duration-200 hover:opacity-85"
        >
          Új szolgáltatás
        </button>
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {editing && (
        <EventTypeForm
          eventType={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-ink-soft">Betöltés…</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {displayedList.map((et) => (
            <li
              key={et.id}
              draggable
              onDragStart={() => setDraggedId(et.id)}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggedId && draggedId !== et.id) setOverId(et.id);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop();
              }}
              onDragEnd={() => {
                setDraggedId(null);
                setOverId(null);
              }}
              className={[
                "flex cursor-grab items-center justify-between rounded-lg border bg-bg-card px-3 py-2 text-sm transition-colors duration-150",
                draggedId === et.id ? "border-line opacity-50" : "border-line",
              ].join(" ")}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="text-ink-soft select-none"
                  title="Húzd az átrendezéshez"
                >
                  ⠿
                </span>
                <div>
                  <div className="font-medium text-ink">
                    {et.title}{" "}
                    {!et.isActive && (
                      <span className="text-xs text-ink-soft">
                        (archiválva)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-soft">
                    {et.durationMinutes} perc · {formatPriceHuf(et.price)} ·{" "}
                    {et.locations.map((l) => LOCATION_LABELS[l]).join(", ")}
                  </div>
                </div>
              </div>
              {deletingId === et.id ? (
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-ink-soft">
                    Biztos? Nem vonható vissza.
                  </span>
                  <button
                    type="button"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(et.id)}
                    className="text-red-600 hover:underline disabled:opacity-40 dark:text-red-400"
                  >
                    Igen, törlöm
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingId(null)}
                    className="text-ink-soft hover:underline"
                  >
                    Mégse
                  </button>
                </div>
              ) : (
                <div className="flex shrink-0 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(et)}
                    className="text-ink-soft hover:text-accent hover:underline"
                  >
                    Szerkesztés
                  </button>
                  {et.isActive ? (
                    <button
                      type="button"
                      onClick={() => archiveMutation.mutate(et.id)}
                      className="text-red-600 hover:underline dark:text-red-400"
                    >
                      Archiválás
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => reactivateMutation.mutate(et.id)}
                      className="text-emerald-700 hover:underline dark:text-emerald-400"
                    >
                      Visszaállítás
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDeletingId(et.id)}
                    className="text-red-600 hover:underline dark:text-red-400"
                  >
                    Törlés
                  </button>
                </div>
              )}
            </li>
          ))}
          {displayedList.length === 0 && (
            <li className="text-sm text-ink-soft">Nincs még szolgáltatás.</li>
          )}
        </ul>
      )}
    </div>
  );
}

function EventTypeForm({
  eventType,
  onClose,
}: {
  eventType: EventType | null;
  onClose: () => void;
}): ReactElement {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(eventType?.title ?? "");
  const [description, setDescription] = useState(eventType?.description ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    eventType?.durationMinutes ?? 60,
  );
  const [price, setPrice] = useState(eventType?.price ?? 0);
  const [locations, setLocations] = useState<LocationType[]>(
    eventType?.locations ?? ["GOOGLE_MEET"],
  );
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      eventType
        ? adminApi.updateEventType(eventType.id, {
            title,
            description: description || undefined,
            durationMinutes,
            price,
            locations,
          })
        : adminApi.createEventType({
            title,
            description: description || undefined,
            durationMinutes,
            price,
            locations,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "event-types"] });
      onClose();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const toggleLocation = (loc: LocationType) => {
    setLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc],
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-6 flex flex-col gap-3 rounded-xl border border-line bg-bg-card p-4"
    >
      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">Cím</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-line bg-bg px-2 py-1.5 text-ink"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1.5 block text-[13.5px] text-ink-soft">Leírás</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-line bg-bg px-2 py-1.5 text-ink"
        />
      </label>
      <div className="flex gap-3">
        <label className="text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">
            Időtartam (perc)
          </span>
          <input
            type="number"
            min={5}
            max={1440}
            required
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="w-32 rounded-lg border border-line bg-bg px-2 py-1.5 text-ink"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">
            Ár (HUF)
          </span>
          <input
            type="number"
            min={0}
            step={100}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="w-32 rounded-lg border border-line bg-bg px-2 py-1.5 text-ink"
          />
          <span className="mt-1 block text-xs text-ink-soft">
            0 = nincs ár megjelenítve (Díjmentes)
          </span>
        </label>
      </div>
      <fieldset className="text-sm">
        <legend className="mb-1 text-ink-soft">Helyszínek</legend>
        <div className="flex gap-4 text-ink-soft">
          {ALL_LOCATIONS.map((loc) => (
            <label key={loc} className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={locations.includes(loc)}
                onChange={() => toggleLocation(loc)}
              />
              {LOCATION_LABELS[loc]}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={mutation.isPending || locations.length === 0}
          className="rounded-full bg-ink px-4 py-1.5 text-sm text-bg transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
        >
          Mentés
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-line px-4 py-1.5 text-sm text-ink-soft hover:border-accent hover:text-accent"
        >
          Mégse
        </button>
      </div>
    </form>
  );
}
