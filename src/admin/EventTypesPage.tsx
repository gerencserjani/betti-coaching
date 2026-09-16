import { useState, type FormEvent, type ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import type { EventType, LocationType } from "../api/models";
import { LOCATION_LABELS } from "./utils";

const ALL_LOCATIONS: LocationType[] = ["IN_PERSON", "GOOGLE_MEET", "PHONE"];

export default function EventTypesPage(): ReactElement {
  const queryClient = useQueryClient();
  const { data: eventTypes, isLoading } = useQuery({
    queryKey: ["admin", "event-types"],
    queryFn: adminApi.eventTypesMine,
  });
  const [editing, setEditing] = useState<EventType | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Szolgáltatások</h1>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800"
        >
          Új szolgáltatás
        </button>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {editing && (
        <EventTypeForm
          eventType={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}

      {isLoading ? (
        <p className="text-sm text-gray-500">Betöltés…</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {eventTypes?.map((et) => (
            <li
              key={et.id}
              className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <div>
                <div className="font-medium">
                  {et.title}{" "}
                  {!et.isActive && (
                    <span className="text-xs text-gray-400">(archiválva)</span>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {et.durationMinutes} perc ·{" "}
                  {et.locations.map((l) => LOCATION_LABELS[l]).join(", ")}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(et)}
                  className="text-gray-600 hover:underline"
                >
                  Szerkesztés
                </button>
                {et.isActive ? (
                  <button
                    type="button"
                    onClick={() => archiveMutation.mutate(et.id)}
                    className="text-red-600 hover:underline"
                  >
                    Archiválás
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => reactivateMutation.mutate(et.id)}
                    className="text-green-700 hover:underline"
                  >
                    Visszaállítás
                  </button>
                )}
              </div>
            </li>
          ))}
          {eventTypes?.length === 0 && (
            <li className="text-sm text-gray-400">Nincs még szolgáltatás.</li>
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
            locations,
          })
        : adminApi.createEventType({
            title,
            description: description || undefined,
            durationMinutes,
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
      className="mb-6 flex flex-col gap-3 rounded border border-gray-200 bg-white p-4"
    >
      <label className="text-sm">
        <span className="mb-1 block text-gray-600">Cím</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1.5"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-gray-600">Leírás</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1.5"
        />
      </label>
      <label className="text-sm">
        <span className="mb-1 block text-gray-600">Időtartam (perc)</span>
        <input
          type="number"
          min={5}
          max={1440}
          required
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          className="w-32 rounded border border-gray-300 px-2 py-1.5"
        />
      </label>
      <fieldset className="text-sm">
        <legend className="mb-1 text-gray-600">Helyszínek</legend>
        <div className="flex gap-4">
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={mutation.isPending || locations.length === 0}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Mentés
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          Mégse
        </button>
      </div>
    </form>
  );
}
