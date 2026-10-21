import type { ReactElement } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ThemeToggle from "../components/ThemeToggle.tsx";
import { siteName } from "../content/site";
import brandLogo from "../assets/brand-logo.webp";

const navItems = [
  { to: "/admin/bookings", label: "Foglalások" },
  { to: "/admin/availability", label: "Elérhetőség" },
  { to: "/admin/event-types", label: "Szolgáltatások" },
  { to: "/admin/google", label: "Google Naptár" },
  { to: "/admin/settings", label: "Beállítások" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded-lg px-3 py-2 text-sm transition-colors duration-200",
    isActive
      ? "bg-ink text-bg"
      : "text-ink-soft hover:bg-bg-panel hover:text-ink",
  ].join(" ");

// Same look, just compact enough to sit in a single-row, horizontally
// scrollable strip instead of a stacked column -- used below md only.
const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "shrink-0 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors duration-200",
    isActive ? "bg-ink text-bg" : "bg-bg-panel text-ink-soft hover:text-ink",
  ].join(" ");

export default function AdminLayout(): ReactElement {
  const { coach, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink md:flex-row">
      {/* Below md: a compact top bar (logo + horizontally scrollable nav +
          logout) replaces the full sidebar -- a fixed 224px-wide column
          would otherwise eat more than half of a phone's own width. */}
      <header className="flex items-center gap-3 border-b border-line bg-bg-card p-3 md:hidden">
        <img
          src={brandLogo}
          alt={siteName}
          className="h-9 w-9 shrink-0 transition-[filter] duration-200 dark:[filter:invert(1)_hue-rotate(180deg)_brightness(1.15)_contrast(0.92)]"
        />
        <nav className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={mobileNavLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          aria-label="Kijelentkezés"
          className="shrink-0 rounded-lg border border-line p-2 text-ink-soft transition-colors duration-200 hover:border-accent hover:text-accent"
        >
          ⏻
        </button>
      </header>

      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-bg-card p-4 md:flex">
        <img
          src={brandLogo}
          alt={siteName}
          className="mb-5 h-14 w-14 transition-[filter] duration-200 dark:[filter:invert(1)_hue-rotate(180deg)_brightness(1.15)_contrast(0.92)]"
        />
        <div className="mb-6">
          <div className="text-sm font-semibold">{coach?.name}</div>
          <div className="text-xs text-ink-soft">{coach?.email}</div>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
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
      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
