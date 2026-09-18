import { afterEach, describe, expect, it, vi } from "vitest";
import { initAnalytics } from "./analytics";

describe("initAnalytics", () => {
  afterEach(() => {
    document
      .querySelectorAll("script[data-domain]")
      .forEach((el) => el.remove());
    vi.unstubAllEnvs();
    window.history.pushState({}, "", "/");
  });

  it("does not inject a script when both env vars are unset", () => {
    vi.stubEnv("VITE_PLAUSIBLE_DOMAIN", "");
    vi.stubEnv("VITE_PLAUSIBLE_API_HOST", "");

    initAnalytics();

    expect(document.querySelector("script[data-domain]")).toBeNull();
  });

  it("does not inject a script when only one of the two env vars is set", () => {
    vi.stubEnv("VITE_PLAUSIBLE_DOMAIN", "localhost");
    vi.stubEnv("VITE_PLAUSIBLE_API_HOST", "");

    initAnalytics();

    expect(document.querySelector("script[data-domain]")).toBeNull();
  });

  it("injects the Plausible script with the configured domain and host", () => {
    vi.stubEnv("VITE_PLAUSIBLE_DOMAIN", "localhost");
    vi.stubEnv("VITE_PLAUSIBLE_API_HOST", "http://localhost:8000");

    initAnalytics();

    const script = document.querySelector<HTMLScriptElement>(
      "script[data-domain]",
    );
    expect(script).not.toBeNull();
    expect(script?.dataset.domain).toBe("localhost");
    expect(script?.src).toBe("http://localhost:8000/js/script.js");
    expect(script?.defer).toBe(true);
  });

  it("does not inject a script on admin routes", () => {
    vi.stubEnv("VITE_PLAUSIBLE_DOMAIN", "localhost");
    vi.stubEnv("VITE_PLAUSIBLE_API_HOST", "http://localhost:8000");
    window.history.pushState({}, "", "/admin/login");

    initAnalytics();

    expect(document.querySelector("script[data-domain]")).toBeNull();
  });
});
