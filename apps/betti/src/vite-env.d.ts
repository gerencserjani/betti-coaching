/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_PLACES_API_KEY?: string;
  // index.html's title/meta/OG/Twitter tags and CoachConfig.siteName read
  // these -- see apps/betti/.env's own comment for why.
  readonly VITE_SITE_NAME: string;
  readonly VITE_SITE_TITLE: string;
  readonly VITE_SITE_DESCRIPTION: string;
  // Identifies this frontend's own coach/business to the shared backend on
  // every public request (see backend issue #14) -- the backend has no
  // other way to know which coach's data an anonymous request is for.
  // One value per frontend deployment: one backend can serve many
  // independent frontends this way, each with its own VITE_COACH_ID.
  readonly VITE_COACH_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
