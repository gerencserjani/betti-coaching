import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { RequireAdmin, RequireAuth } from "./RequireAuth";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import type { Coach } from "../api/models";

const baseCoach: Coach = {
  id: "coach-1",
  email: "coach@example.com",
  name: "Teszt Coach",
  role: "COACH",
  preferredLocale: "hu",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

function renderGuarded(
  authValue: Partial<AuthContextValue>,
  guard: "auth" | "admin" = "auth",
) {
  const value: AuthContextValue = {
    coach: null,
    isLoading: false,
    login: async () => {},
    logout: () => {},
    ...authValue,
  };
  const GuardElement = guard === "auth" ? <RequireAuth /> : <RequireAdmin />;

  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={["/admin/bookings"]}>
        <Routes>
          <Route path="/admin/login" element={<div>Login page</div>} />
          <Route element={GuardElement}>
            <Route
              path="/admin/bookings"
              element={<div>Protected content</div>}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("RequireAuth", () => {
  it("shows a loading state while auth is resolving", () => {
    renderGuarded({ isLoading: true });
    expect(screen.getByText("Betöltés…")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("redirects to /admin/login when there's no coach", () => {
    renderGuarded({ coach: null });
    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the protected content when a coach is present", () => {
    renderGuarded({ coach: baseCoach });
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});

describe("RequireAdmin", () => {
  it("redirects to /admin/login when there's no coach", () => {
    renderGuarded({ coach: null }, "admin");
    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("shows a permission message for a non-admin coach", () => {
    renderGuarded({ coach: baseCoach }, "admin");
    expect(
      screen.getByText(
        "Ehhez az oldalhoz adminisztrátori jogosultság szükséges.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the protected content for an admin coach", () => {
    renderGuarded({ coach: { ...baseCoach, role: "ADMIN" } }, "admin");
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });
});
