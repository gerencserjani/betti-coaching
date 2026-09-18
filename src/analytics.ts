/**
 * Loads the Plausible tracking script, only when both env vars are set.
 * Deliberately unset in production for now -- this is being wired up
 * against a self-hosted local instance first; activating it for real
 * traffic is a separate, later decision (just setting the two env vars
 * in the hosting platform's dashboard).
 */
export function initAnalytics(): void {
  const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  const apiHost = import.meta.env.VITE_PLAUSIBLE_API_HOST;
  if (!domain || !apiHost) return;
  // The admin panel is the coach's own tool, not visitor traffic -- don't
  // count her own usage as a pageview.
  if (window.location.pathname.startsWith("/admin")) return;

  const script = document.createElement("script");
  script.defer = true;
  script.dataset.domain = domain;
  script.src = `${apiHost}/js/script.js`;
  document.head.appendChild(script);
}
