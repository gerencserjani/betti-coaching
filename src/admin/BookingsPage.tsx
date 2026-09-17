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

  if (isLoading) return <p className="text-sm text-ink-soft">Betöltés…</p>;

  return (
    <div>
      <h1 className="mb-4 text-xl text-ink">Foglalások</h1>

      <div className="mb-4 flex gap-2">
        {(["CONFIRMED", "CANCELLED", "ALL"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={[
              "rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200",
              statusFilter === s
                ? "border-ink bg-ink text-bg"
                : "border-line text-ink-soft hover:border-accent hover:text-accent",
            ].join(" ")}
          >
            {s === "ALL" ? "Mind" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-line bg-bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
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
              <tr key={booking.id} className="border-b border-line">
                <td className="px-3 py-2">{formatDateTime(booking.startAt)}</td>
                <td className="px-3 py-2">{booking.eventType.title}</td>
                <td className="px-3 py-2">
                  <div>{booking.clientName}</div>
                  <div className="text-xs text-ink-soft">
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
                        className="text-sm text-red-600 hover:underline dark:text-red-400"
                      >
                        Lemondás
                      </button>
                    ))}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-ink-soft">
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
        className="w-40 rounded-lg border border-line bg-bg px-2 py-1 text-sm text-ink"
      />
      <button
        type="button"
        disabled={!reason || isPending}
        onClick={() => onSubmit(reason)}
        className="text-sm text-red-600 hover:underline disabled:opacity-40 dark:text-red-400"
      >
        Megerősít
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm text-ink-soft hover:underline"
      >
        Mégse
      </button>
    </div>
  );
}
