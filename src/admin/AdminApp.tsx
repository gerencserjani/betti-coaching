import type { ReactElement } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./AuthProvider.tsx";
import { RequireAuth } from "./RequireAuth";
import AdminLayout from "./AdminLayout.tsx";
import LoginPage from "./LoginPage.tsx";
import BookingsPage from "./BookingsPage.tsx";
import AvailabilityPage from "./AvailabilityPage.tsx";
import EventTypesPage from "./EventTypesPage.tsx";
import SettingsPage from "./SettingsPage.tsx";
import GoogleStatusPage from "./GoogleStatusPage.tsx";

export default function AdminApp(): ReactElement {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            {/* Bare /admin (and any unmatched /admin/* path) previously hit
                no route at all -- Routes rendered null with App.tsx's
                Suspense fallback also null, so the whole page just went
                blank with no console error. RequireAuth above still sends
                unauthenticated visitors to /admin/login first. */}
            <Route index element={<Navigate to="bookings" replace />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="event-types" element={<EventTypesPage />} />
            {/* Any authenticated coach, not just ADMIN -- both settings.
                controller.ts's update() and google.controller.ts's routes
                only ever act on the caller's own coachId, so there's
                nothing here to restrict by role (see those backends'
                own comments). */}
            <Route path="settings" element={<SettingsPage />} />
            <Route path="google" element={<GoogleStatusPage />} />
            <Route path="*" element={<Navigate to="bookings" replace />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
