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
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded border border-gray-200 bg-white p-6"
      >
        <h1 className="mb-4 text-lg font-semibold text-gray-900">
          Bejelentkezés
        </h1>

        <label className="mb-3 block text-sm">
          <span className="mb-1 block text-gray-600">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block text-gray-600">Jelszó</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {isSubmitting ? "Bejelentkezés…" : "Bejelentkezés"}
        </button>
      </form>
    </div>
  );
}
