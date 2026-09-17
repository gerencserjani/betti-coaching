import "./App.css";
import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import PublicSite from "./PublicSite.tsx";

// Code-split: the admin dashboard is a large, separate bundle that public
// visitors (the vast majority) never need to download.
const AdminApp = lazy(() => import("./admin/AdminApp.tsx"));

function App() {
  return (
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
  );
}

export default App;
