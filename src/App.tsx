import "./App.css";
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import PublicSite from "./PublicSite.tsx";
import { beforeSend } from "./analytics";

// Code-split: the admin dashboard is a large, separate bundle that public
// visitors (the vast majority) never need to download.
const AdminApp = lazy(() => import("./admin/AdminApp.tsx"));
// A newly invited coach lands here from an emailed link, before she has any
// session -- kept as its own top-level route (not nested under /admin/*) so
// it never passes through RequireAuth/AuthProvider's "am I logged in" check.
const AcceptInvitePage = lazy(() => import("./admin/AcceptInvitePage.tsx"));
// Same reasoning as AcceptInvitePage above, and for a more specific reason
// than just "no session yet": these call setAuthToken() directly (not
// AuthProvider's own login()), so AuthProvider's in-memory `coach` state
// would never learn about it if these were nested inside AdminApp's
// already-mounted AuthProvider -- navigating to /admin afterwards would
// find `coach` still null and bounce right back to /admin/login. Being
// top-level means AuthProvider mounts fresh on that next navigation and
// picks up the token correctly from the start, same as AcceptInvitePage.
const ForgotPasswordPage = lazy(() => import("./admin/ForgotPasswordPage.tsx"));
const ResetPasswordPage = lazy(() => import("./admin/ResetPasswordPage.tsx"));

function App() {
  return (
    <>
      <Analytics beforeSend={beforeSend} />
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={null}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route
          path="/accept-invite"
          element={
            <Suspense fallback={null}>
              <AcceptInvitePage />
            </Suspense>
          }
        />
        <Route
          path="/admin/forgot-password"
          element={
            <Suspense fallback={null}>
              <ForgotPasswordPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/reset-password"
          element={
            <Suspense fallback={null}>
              <ResetPasswordPage />
            </Suspense>
          }
        />
        <Route path="/*" element={<PublicSite />} />
      </Routes>
    </>
  );
}

export default App;
