import type { ReactElement } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RequireAuth(): ReactElement {
  const { coach, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-sm text-gray-500">Betöltés…</div>;
  }

  if (!coach) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}

export function RequireAdmin(): ReactElement {
  const { coach, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-sm text-gray-500">Betöltés…</div>;
  }

  if (!coach) {
    return <Navigate to="/admin/login" replace />;
  }

  if (coach.role !== "ADMIN") {
    return (
      <div className="p-8 text-sm text-red-600">
        Ehhez az oldalhoz adminisztrátori jogosultság szükséges.
      </div>
    );
  }

  return <Outlet />;
}
