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

/**
 * Thrown by unwrap() (in endpoints.ts) specifically when the backend
 * responded with an error body -- a marker that `.message` is safe to show
 * the user. Any OTHER thrown value (a native fetch TypeError on a network
 * failure, an unrelated JS exception) is NOT an ApiError, so getErrorMessage
 * below won't mistake its raw technical message for a user-facing one.
 */
export class ApiError extends Error {}

/** Backend error body -> a display string. Used only when building an ApiError. */
export function extractApiErrorMessage(body: unknown): string {
  const parsed = body as ApiErrorBody | undefined;
  const msg = parsed?.message;
  if (Array.isArray(msg)) return msg.join(" ");
  if (typeof msg === "string") return msg;
  return "Váratlan hiba történt.";
}

export function getErrorMessage(
  error: unknown,
  fallback = "Váratlan hiba történt.",
): string {
  return error instanceof ApiError ? error.message : fallback;
}
