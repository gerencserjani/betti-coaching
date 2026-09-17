import { useState, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";
import { formatDateTime } from "./utils";

export default function GoogleStatusPage(): ReactElement {
  const { data: status, isLoading } = useQuery({
    queryKey: ["admin", "google-status"],
    queryFn: adminApi.googleStatus,
  });
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // The connect/callback round trip is a full-page navigation through
  // Google's consent screen, so it can't carry our normal Authorization
  // header -- instead we mint a short-lived, admin-authenticated token here
  // (a real fetch, so it DOES carry the header) and hand it to the backend
  // as the OAuth `state` param, which proves this navigation was actually
  // started by a logged-in admin. See the backend's GoogleController.
  const handleConnect = async () => {
    setError(null);
    setConnecting(true);
    try {
      const { state } = await adminApi.googleConnectState();
      window.location.href = `${import.meta.env.VITE_API_URL}/admin/google/connect?state=${encodeURIComponent(state)}`;
    } catch (err) {
      setError(getErrorMessage(err));
      setConnecting(false);
    }
  };

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

          {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting}
            className="mt-4 inline-block rounded-full border border-line px-4 py-1.5 text-ink-soft transition-colors duration-200 hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {status?.connected ? "Fiók váltása" : "Összekapcsolás"}
          </button>
        </div>
      )}
    </div>
  );
}
