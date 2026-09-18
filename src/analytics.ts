import type { BeforeSendEvent } from "@vercel/analytics/react";

// The admin panel is the coach's own tool, not visitor traffic -- don't
// count her own usage as a pageview.
export function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  return event.url.includes("/admin") ? null : event;
}
