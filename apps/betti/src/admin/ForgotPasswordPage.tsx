import { useState, type FormEvent, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/endpoints";
import { getErrorMessage } from "../api/client";

/**
 * Deliberately shows the same success state whether or not the email has
 * an account -- the backend's POST /auth/forgot-password always resolves
 * the same way too (see AuthService.forgotPassword's own comment), so
 * nothing here should reveal anything different either.
 */
export default function ForgotPasswordPage(): ReactElement {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, "Sikertelen kérés."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-sm rounded-xl border border-line bg-bg-card p-6">
        <h1 className="mb-4 text-xl text-ink">Elfelejtett jelszó</h1>

        {sent ? (
          <p className="text-sm text-ink-soft">
            Ha létezik fiók ezzel az email címmel, elküldtük rá a jelszó
            visszaállításához szükséges linket.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="mb-4 block text-sm">
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

            {error && (
              <p className="mb-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-ink px-4 py-2.5 text-sm text-bg transition-opacity duration-200 hover:opacity-85 disabled:opacity-50"
            >
              {isSubmitting ? "Küldés…" : "Új jelszó kérése"}
            </button>
          </form>
        )}

        <Link
          to="/admin/login"
          className="mt-4 block text-center text-sm text-ink-soft hover:text-accent"
        >
          Vissza a bejelentkezéshez
        </Link>
      </div>
    </div>
  );
}
