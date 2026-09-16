import type { ReactElement } from "react";
import { Routes, Route } from "react-router-dom";
import AuthProvider from "./AuthProvider.tsx";
import { RequireAuth, RequireAdmin } from "./RequireAuth";
import AdminLayout from "./AdminLayout.tsx";
import LoginPage from "./LoginPage.tsx";
import BookingsPage from "./BookingsPage.tsx";
import AvailabilityPage from "./AvailabilityPage.tsx";
import EventTypesPage from "./EventTypesPage.tsx";
import CoachesPage from "./CoachesPage.tsx";
import SettingsPage from "./SettingsPage.tsx";
import GoogleStatusPage from "./GoogleStatusPage.tsx";

export default function AdminApp(): ReactElement {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="event-types" element={<EventTypesPage />} />
            <Route element={<RequireAdmin />}>
              <Route path="coaches" element={<CoachesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="google" element={<GoogleStatusPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
