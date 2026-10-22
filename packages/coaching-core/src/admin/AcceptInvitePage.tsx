import { useMemo, useState, type FormEvent, type ReactElement } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/endpoints";
import { getErrorMessage, setAuthToken } from "../api/client";

/**
 * Best-effort, unverified decode of the invite token's payload, purely to
 * greet the invited coach by name before she types a password -- the actual
 * verification (signature + expiry + purpose) happens server-side when the
 * form submits. JWTs are signed, not encrypted, so this is just base64url
 * decoding, not a security boundary.
 */
function decodeInvitePayload(
  token: string,
): { email: string; name: string } | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    // atob() decodes to a binary (Latin1) string, one char per byte -- the
    // JWT payload is UTF-8 JSON though, so a name with accented characters
    // (ö, é, ő, ...) needs this re-decode or it comes out as mojibake.
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as {
      email?: string;
      name?: string;
    };
    if (!payload.email || !payload.name) return null;
    return { email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}

export default function AcceptInvitePage(): ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const invite = useMemo(
    () => (token ? decodeInvitePayload(token) : null),
    [token],
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!token) {
    return (
      <AcceptInviteLayout>
        <p className="text-sm text-red-600 dark:text-red-400">
          Hiányzik vagy érvénytelen a meghívó link. Kérj új meghívót.
        </p>
      </AcceptInviteLayout>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("A két jelszó nem egyezik.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { accessToken } = await authApi.acceptInvite({ token, password });
      setAuthToken(accessToken);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "A meghívó érvénytelen vagy már lejárt."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AcceptInviteLayout>
      <h1 className="mb-1 text-xl text-ink">Üdvözlünk!</h1>
      <p className="mb-4 text-sm text-ink-soft">
        {invite
          ? `Szia ${invite.name}! Állítsd be a jelszavadat (${invite.email}) a fiókod aktiválásához.`
          : "Állítsd be a jelszavadat a fiókod aktiválásához."}
      </p>

      <form onSubmit={handleSubmit}>
        <label className="mb-3 block text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">
            Jelszó (min. 8 karakter)
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-line bg-bg px-4 py-2.5 text-sm text-ink"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1.5 block text-[13.5px] text-ink-soft">
            Jelszó megerősítése
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
          {isSubmitting ? "Mentés…" : "Jelszó beállítása"}
        </button>
      </form>
    </AcceptInviteLayout>
  );
}

function AcceptInviteLayout({
  children,
}: {
  children: ReactElement | ReactElement[];
}): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-sm rounded-xl border border-line bg-bg-card p-6">
        {children}
      </div>
    </div>
  );
}
