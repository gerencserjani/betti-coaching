import { describe, expect, it } from "vitest";
import { beforeSend } from "./analytics";

describe("beforeSend", () => {
  it("drops events for admin routes", () => {
    expect(
      beforeSend({ url: "https://example.com/admin/login" } as never),
    ).toBeNull();
    expect(
      beforeSend({ url: "https://example.com/admin/bookings" } as never),
    ).toBeNull();
  });

  it("keeps events for public routes", () => {
    const event = { url: "https://example.com/" } as never;
    expect(beforeSend(event)).toBe(event);
  });
});
