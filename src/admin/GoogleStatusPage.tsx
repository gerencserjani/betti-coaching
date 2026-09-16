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
      <h1 className="mb-4 text-lg font-semibold">Google Naptár kapcsolat</h1>

      {isLoading ? (
        <p className="text-sm text-gray-500">Betöltés…</p>
      ) : (
        <div className="max-w-md rounded border border-gray-200 bg-white p-4 text-sm">
          {status?.connected ? (
            <>
              <p className="mb-1 text-green-700">Kapcsolódva</p>
              <p className="text-gray-600">{status.connectedEmail}</p>
              {status.connectedAt && (
                <p className="text-xs text-gray-400">
                  {formatDateTime(status.connectedAt)} óta
                </p>
              )}
            </>
          ) : (
            <p className="text-gray-600">Nincs összekötve Google-fiók.</p>
          )}

          <a
            href={connectUrl}
            className="mt-4 inline-block rounded border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
          >
            {status?.connected ? "Fiók váltása" : "Összekapcsolás"}
          </a>
        </div>
      )}
    </div>
  );
}
