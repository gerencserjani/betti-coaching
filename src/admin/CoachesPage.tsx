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
      <h1 className="mb-4 text-xl text-ink">Coach fiókok</h1>

      <form
        onSubmit={handleSubmit}
        className="mb-6 flex flex-wrap items-end gap-2 rounded-xl border border-line bg-bg-card p-4"
      >
        <label className="text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">Név</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2 py-1.5 text-ink"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2 py-1.5 text-ink"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">
            Jelszó (min. 8 karakter)
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-line bg-bg px-2 py-1.5 text-ink"
          />
        </label>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-full bg-ink px-4 py-1.5 text-sm text-bg transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
        >
          Fiók létrehozása
        </button>
      </form>

      {error && (
        <p className="mb-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {isLoading ? (
        <p className="text-sm text-ink-soft">Betöltés…</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {coaches?.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-lg border border-line bg-bg-card px-3 py-2 text-sm"
            >
              <span>
                {c.name} · {c.email}
              </span>
              <span className="text-xs text-ink-soft">{c.role}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
