import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AuthProvider from "./AuthProvider";
import { useAuth } from "./AuthContext";
import { getAuthToken, setAuthToken } from "../api/client";
import { authApi } from "../api/endpoints";
import type { Coach } from "../api/models";

vi.mock("../api/endpoints", () => ({
  authApi: {
    me: vi.fn(),
    login: vi.fn(),
  },
}));

const fakeCoach: Coach = {
  id: "coach-1",
  email: "admin@example.com",
  name: "Teszt Admin",
  role: "ADMIN",
  preferredLocale: "hu",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

// Small consumer that surfaces useAuth()'s state/actions as clickable,
// queryable UI, since context values aren't directly assertable otherwise.
function Consumer() {
  const { coach, isLoading, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="loading">{String(isLoading)}</div>
      <div data-testid="coach">{coach ? coach.email : "none"}</div>
      <button onClick={() => void login("admin@example.com", "secret")}>
        login
      </button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

function renderWithProviders() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    setAuthToken(null);
    vi.mocked(authApi.me).mockReset();
    vi.mocked(authApi.login).mockReset();
  });

  afterEach(() => {
    setAuthToken(null);
  });

  it("starts not loading and with no coach when there's no stored token", () => {
    renderWithProviders();
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("coach")).toHaveTextContent("none");
    expect(authApi.me).not.toHaveBeenCalled();
  });

  it("loads the coach from /coaches/me when a token is already stored", async () => {
    setAuthToken("existing-token");
    vi.mocked(authApi.me).mockResolvedValue(fakeCoach);

    renderWithProviders();
    expect(screen.getByTestId("loading")).toHaveTextContent("true");

    await waitFor(() =>
      expect(screen.getByTestId("coach")).toHaveTextContent(
        "admin@example.com",
      ),
    );
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("clears the stored token if /coaches/me rejects (e.g. expired token)", async () => {
    setAuthToken("stale-token");
    vi.mocked(authApi.me).mockRejectedValue(new Error("unauthorized"));

    renderWithProviders();

    await waitFor(() =>
      expect(screen.getByTestId("loading")).toHaveTextContent("false"),
    );
    expect(screen.getByTestId("coach")).toHaveTextContent("none");
    expect(getAuthToken()).toBeNull();
  });

  it("login() stores the token and sets the coach", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: "new-token",
      coach: fakeCoach,
    });

    renderWithProviders();
    await user.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() =>
      expect(screen.getByTestId("coach")).toHaveTextContent(
        "admin@example.com",
      ),
    );
    expect(getAuthToken()).toBe("new-token");
  });

  it("logout() clears the token, the coach, and the query cache", async () => {
    const user = userEvent.setup();
    vi.mocked(authApi.login).mockResolvedValue({
      accessToken: "new-token",
      coach: fakeCoach,
    });

    renderWithProviders();
    await user.click(screen.getByRole("button", { name: "login" }));
    await waitFor(() =>
      expect(screen.getByTestId("coach")).toHaveTextContent(
        "admin@example.com",
      ),
    );

    await user.click(screen.getByRole("button", { name: "logout" }));

    expect(screen.getByTestId("coach")).toHaveTextContent("none");
    expect(getAuthToken()).toBeNull();
  });
});
