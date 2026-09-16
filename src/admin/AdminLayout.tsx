import type { ReactElement } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ThemeToggle from "../components/ThemeToggle.tsx";
import { siteName } from "../content/site";
import brandLogo from "../assets/brand-logo.webp";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-lg px-3 py-2 text-sm transition-colors duration-200",
    isActive
      ? "bg-ink text-bg"
      : "text-ink-soft hover:bg-bg-panel hover:text-ink",
  ].join(" ");

export default function AdminLayout(): ReactElement {
  const { coach, logout } = useAuth();
  const isAdmin = coach?.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-bg text-ink">
      <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-bg-card p-4">
        <img
          src={brandLogo}
          alt={siteName}
          className="mb-5 h-9 w-auto transition-[filter] duration-200 dark:[filter:invert(1)_hue-rotate(180deg)_brightness(1.15)_contrast(0.92)]"
        />
        <div className="mb-6">
          <div className="text-sm font-semibold">{coach?.name}</div>
          <div className="text-xs text-ink-soft">{coach?.email}</div>
        </div>
        <nav className="flex flex-col gap-1">
          <NavLink to="/admin/bookings" className={navLinkClass}>
            Foglalások
          </NavLink>
          <NavLink to="/admin/availability" className={navLinkClass}>
            Elérhetőség
          </NavLink>
          <NavLink to="/admin/event-types" className={navLinkClass}>
            Szolgáltatások
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/admin/coaches" className={navLinkClass}>
                Coach fiókok
              </NavLink>
              <NavLink to="/admin/google" className={navLinkClass}>
                Google Naptár
              </NavLink>
              <NavLink to="/admin/settings" className={navLinkClass}>
                Beállítások
              </NavLink>
            </>
          )}
        </nav>
        <div className="mt-auto flex items-center gap-2 pt-6">
          <button
            type="button"
            onClick={logout}
            className="flex-1 rounded-lg border border-line px-3 py-2 text-left text-sm text-ink-soft transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            Kijelentkezés
          </button>
          <ThemeToggle />
        </div>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
