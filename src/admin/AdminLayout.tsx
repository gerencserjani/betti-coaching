import type { ReactElement } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "block rounded px-3 py-2 text-sm",
    isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100",
  ].join(" ");

export default function AdminLayout(): ReactElement {
  const { coach, logout } = useAuth();
  const isAdmin = coach?.role === "ADMIN";

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white p-4">
        <div className="mb-6">
          <div className="text-sm font-semibold">{coach?.name}</div>
          <div className="text-xs text-gray-500">{coach?.email}</div>
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
        <button
          type="button"
          onClick={logout}
          className="mt-6 w-full rounded border border-gray-300 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-100"
        >
          Kijelentkezés
        </button>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
