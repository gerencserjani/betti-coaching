import createClient from "openapi-fetch";
import type { paths } from "./types.generated";

const AUTH_TOKEN_KEY = "calendar_auth_token";

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // localStorage unavailable (private mode, etc.) -- auth just won't persist
  }
}

export const apiClient = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
});

apiClient.use({
  onRequest({ request }) {
    const token = getAuthToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
});

interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Váratlan hiba történt.",
): string {
  const body = error as ApiErrorBody | undefined;
  const msg = body?.message;
  if (Array.isArray(msg)) return msg.join(" ");
  if (typeof msg === "string") return msg;
  return fallback;
}
