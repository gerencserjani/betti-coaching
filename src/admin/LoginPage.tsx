import { useState, type FormEvent, type ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { getErrorMessage } from "../api/client";

export default function LoginPage(): ReactElement {
  const { coach, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (coach) {
    return <Navigate to="/admin/bookings" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(getErrorMessage(err, "Sikertelen bejelentkezés."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-line bg-bg-card p-6"
      >
        <h1 className="mb-4 text-xl text-ink">Bejelentkezés</h1>

        <label className="mb-3 block text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">
            Email
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">
            Jelszó
          </span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink"
          />
        </label>

        {error && (
          <p className="mb-4 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-ink px-4 py-2.5 text-sm text-bg transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
        >
          {isSubmitting ? "Bejelentkezés…" : "Bejelentkezés"}
        </button>
      </form>
    </div>
  );
}
