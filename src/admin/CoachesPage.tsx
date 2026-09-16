import { useState, type FormEvent, type ReactElement } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";

export default function CoachesPage(): ReactElement {
  const queryClient = useQueryClient();
  const { data: coaches, isLoading } = useQuery({
    queryKey: ["admin", "coaches"],
    queryFn: adminApi.coaches,
  });
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: adminApi.createCoach,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "coaches"] });
      setEmail("");
      setName("");
      setPassword("");
      setError(null);
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ email, name, password });
  };

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Coach fiókok</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-wrap items-end gap-2 rounded border border-gray-200 bg-white p-4"
      >
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">Név</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-gray-600">
            Jelszó (min. 8 karakter)
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1.5"
          />
        </label>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          Fiók létrehozása
        </button>
      </form>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {isLoading ? (
        <p className="text-sm text-gray-500">Betöltés…</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {coaches?.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <span>
                {c.name} · {c.email}
              </span>
              <span className="text-xs text-gray-400">{c.role}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
