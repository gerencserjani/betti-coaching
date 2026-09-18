/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_PLACES_API_KEY?: string;
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_PLAUSIBLE_API_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
