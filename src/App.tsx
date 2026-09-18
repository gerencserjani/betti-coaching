import "./App.css";
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import PublicSite from "./PublicSite.tsx";
import { beforeSend } from "./analytics";

// Code-split: the admin dashboard is a large, separate bundle that public
// visitors (the vast majority) never need to download.
const AdminApp = lazy(() => import("./admin/AdminApp.tsx"));

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
        <Route path="/*" element={<PublicSite />} />
      </Routes>
    </>
  );
}

export default App;
