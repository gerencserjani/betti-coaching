import { useMemo, useState, type ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { formatDateTime, LOCATION_LABELS, STATUS_LABELS } from "./utils";

type StatusFilter = "ALL" | "CONFIRMED" | "CANCELLED";

export default function BookingsPage(): ReactElement {
  const queryClient = useQueryClient();
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: adminApi.bookings,
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("CONFIRMED");
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.cancelBooking(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      setCancelingId(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const filtered = useMemo(() => {
    if (!bookings) return [];
    if (statusFilter === "ALL") return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  if (isLoading) return <p className="text-sm text-gray-500">Betöltés…</p>;

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Foglalások</h1>

      <div className="mb-4 flex gap-2">
        {(["CONFIRMED", "CANCELLED", "ALL"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={[
              "rounded border px-3 py-1.5 text-sm",
              statusFilter === s
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-100",
            ].join(" ")}
          >
            {s === "ALL" ? "Mind" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-gray-500">
            <tr>
              <th className="px-3 py-2">Időpont</th>
              <th className="px-3 py-2">Szolgáltatás</th>
              <th className="px-3 py-2">Ügyfél</th>
              <th className="px-3 py-2">Helyszín</th>
              <th className="px-3 py-2">Státusz</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((booking) => (
              <tr key={booking.id} className="border-b border-gray-100">
                <td className="px-3 py-2">{formatDateTime(booking.startAt)}</td>
                <td className="px-3 py-2">{booking.eventType.title}</td>
                <td className="px-3 py-2">
                  <div>{booking.clientName}</div>
                  <div className="text-xs text-gray-500">
                    {booking.clientEmail} · {booking.clientPhone}
                  </div>
                </td>
                <td className="px-3 py-2">
                  {LOCATION_LABELS[booking.location]}
                </td>
                <td className="px-3 py-2">{STATUS_LABELS[booking.status]}</td>
                <td className="px-3 py-2 text-right">
                  {booking.status === "CONFIRMED" &&
                    (cancelingId === booking.id ? (
                      <CancelForm
                        isPending={cancelMutation.isPending}
                        onCancel={() => setCancelingId(null)}
                        onSubmit={(reason) =>
                          cancelMutation.mutate({ id: booking.id, reason })
                        }
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCancelingId(booking.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Lemondás
                      </button>
                    ))}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-400">
                  Nincs ide tartozó foglalás.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CancelForm({
  onSubmit,
  onCancel,
  isPending,
}: {
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}): ReactElement {
  const [reason, setReason] = useState("");

  return (
    <div className="flex items-center justify-end gap-2">
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Indoklás"
        className="w-40 rounded border border-gray-300 px-2 py-1 text-sm"
      />
      <button
        type="button"
        disabled={!reason || isPending}
        onClick={() => onSubmit(reason)}
        className="text-sm text-red-600 hover:underline disabled:opacity-40"
      >
        Megerősít
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-gray-500 hover:underline"
      >
        Mégse
      </button>
    </div>
  );
}
