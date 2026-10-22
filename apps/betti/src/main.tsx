import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CoachConfigProvider,
  ThemeContextProvider,
  initI18n,
} from "@coaching/core";
import "./index.css";
import hu from "./i18n/locales/hu.json";
import en from "./i18n/locales/en.json";
import { siteUrl } from "./content/site";
import { bettiConfig } from "./coachConfig";
import App from "./App.tsx";

initI18n({ hu, en, siteUrl });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CoachConfigProvider config={bettiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeContextProvider>
            <App />
          </ThemeContextProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </CoachConfigProvider>
  </StrictMode>,
);
