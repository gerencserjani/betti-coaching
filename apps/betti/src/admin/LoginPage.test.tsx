import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { server } from "../test/server";
import AuthProvider from "./AuthProvider";
import LoginPage from "./LoginPage";
import { getAuthToken, setAuthToken } from "../api/client";

const API_URL = import.meta.env.VITE_API_URL;

function renderLoginFlow() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={["/admin/login"]}>
          <Routes>
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin/bookings" element={<div>Bookings page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Email"), "admin@example.com");
  await user.type(screen.getByLabelText("Jelszó"), "correct-password");
  await user.click(screen.getByRole("button", { name: /bejelentkezés/i }));
}

describe("admin login flow", () => {
  it("logs in successfully and redirects to the bookings page", async () => {
    const user = userEvent.setup();
    setAuthToken(null);
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({
          accessToken: "fresh-token",
          coach: {
            id: "coach-1",
            email: "admin@example.com",
            name: "Teszt Admin",
            role: "ADMIN",
            preferredLocale: "hu",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        }),
      ),
    );

    renderLoginFlow();
    await fillAndSubmit(user);

    await waitFor(() =>
      expect(screen.getByText("Bookings page")).toBeInTheDocument(),
    );
    expect(getAuthToken()).toBe("fresh-token");
  });

  it("shows an error and stays on the login form for wrong credentials", async () => {
    const user = userEvent.setup();
    setAuthToken(null);
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json(
          { statusCode: 401, message: "Invalid email or password" },
          { status: 401 },
        ),
      ),
    );

    renderLoginFlow();
    await fillAndSubmit(user);

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(getAuthToken()).toBeNull();
  });
});
