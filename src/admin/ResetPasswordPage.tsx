import { useState, type FormEvent, type ReactElement } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/endpoints";
import { getErrorMessage, setAuthToken } from "../api/client";

export default function ResetPasswordPage(): ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <ResetPasswordLayout>
        <p className="text-sm text-red-600 dark:text-red-400">
          Hiányzik vagy érvénytelen a link. Kérj új jelszó-visszaállítást.
        </p>
      </ResetPasswordLayout>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("A két jelszó nem egyezik.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { accessToken } = await authApi.resetPassword({
        token,
        newPassword,
      });
      setAuthToken(accessToken);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "A link érvénytelen vagy már lejárt."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ResetPasswordLayout>
      <form onSubmit={handleSubmit}>
        <label className="mb-3 block text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">
            Új jelszó (min. 8 karakter)
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">
            Új jelszó megerősítése
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isSubmitting ? "Mentés…" : "Új jelszó beállítása"}
        </button>
      </form>
    </ResetPasswordLayout>
  );
}

function ResetPasswordLayout({
  children,
}: {
  children: ReactElement | ReactElement[];
}): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-sm rounded-xl border border-line bg-bg-card p-6">
        <h1 className="mb-4 text-xl text-ink">Új jelszó beállítása</h1>
        {children}
      </div>
    </div>
  );
}
