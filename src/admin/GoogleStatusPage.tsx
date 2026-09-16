import type { ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/endpoints";
import { formatDateTime } from "./utils";

export default function GoogleStatusPage(): ReactElement {
  const { data: status, isLoading } = useQuery({
    queryKey: ["admin", "google-status"],
    queryFn: adminApi.googleStatus,
  });

  const connectUrl = `${import.meta.env.VITE_API_URL}/admin/google/connect`;

  return (
    <div>
      <h1 className="mb-1 text-xl text-ink">Google Naptár kapcsolat</h1>
      <p className="mb-4 max-w-md text-sm text-ink-soft">
        Ez a kapcsolat kell ahhoz, hogy Google Meet helyszínű foglaláshoz a
        rendszer minden alkalommal új naptáreseményt és Meet-linket tudjon
        létrehozni a coach Google-naptárában.
      </p>

      {isLoading ? (
        <p className="text-sm text-ink-soft">Betöltés…</p>
      ) : (
        <div className="max-w-md rounded-xl border border-line bg-bg-card p-4 text-sm">
          {status?.connected ? (
            <>
              <p className="mb-1 text-emerald-700 dark:text-emerald-400">
                Kapcsolódva
              </p>
              <p className="text-ink-soft">{status.connectedEmail}</p>
              {status.connectedAt && (
                <p className="text-xs text-ink-soft">
                  {formatDateTime(status.connectedAt)} óta
                </p>
              )}
            </>
          ) : (
            <p className="text-ink-soft">Nincs összekötve Google-fiók.</p>
          )}

          <a
            href={connectUrl}
            className="mt-4 inline-block rounded-full border border-line px-4 py-1.5 text-ink-soft transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            {status?.connected ? "Fiók váltása" : "Összekapcsolás"}
          </a>
        </div>
      )}
    </div>
  );
}
