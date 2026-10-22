import { afterEach, describe, expect, it } from "vitest";
import {
  ApiError,
  extractApiErrorMessage,
  getAuthToken,
  getErrorMessage,
  setAuthToken,
} from "./client";

describe("getErrorMessage / ApiError", () => {
  it("shows the message from an ApiError", () => {
    const err = new ApiError("A szolgáltatás már nem elérhető.");
    expect(getErrorMessage(err)).toBe("A szolgáltatás már nem elérhető.");
  });

  it("uses the fallback for a native error, not the error's own message", () => {
    // Regression test: a raw network failure (e.g. `fetch` throwing
    // "Failed to fetch") must never be shown to the user verbatim --
    // only errors we've deliberately wrapped as ApiError are trusted.
    const networkError = new TypeError("Failed to fetch");
    expect(getErrorMessage(networkError)).toBe("Váratlan hiba történt.");
    expect(getErrorMessage(networkError, "Custom fallback")).toBe(
      "Custom fallback",
    );
  });

  it("uses the fallback for a non-Error thrown value", () => {
    expect(getErrorMessage("some string", "fallback")).toBe("fallback");
    expect(getErrorMessage(undefined, "fallback")).toBe("fallback");
  });
});

describe("extractApiErrorMessage", () => {
  it("returns a string message as-is", () => {
    expect(extractApiErrorMessage({ message: "Nem található." })).toBe(
      "Nem található.",
    );
  });

  it("joins an array of validation messages with a space", () => {
    expect(
      extractApiErrorMessage({ message: ["Kötelező mező.", "Túl rövid."] }),
    ).toBe("Kötelező mező. Túl rövid.");
  });

  it("falls back to the generic message when there's no message field", () => {
    expect(extractApiErrorMessage({})).toBe("Váratlan hiba történt.");
    expect(extractApiErrorMessage(undefined)).toBe("Váratlan hiba történt.");
  });
});

describe("getAuthToken / setAuthToken", () => {
  afterEach(() => {
    setAuthToken(null);
  });

  it("returns null when nothing is stored", () => {
    expect(getAuthToken()).toBeNull();
  });

  it("round-trips a token through localStorage", () => {
    setAuthToken("abc123");
    expect(getAuthToken()).toBe("abc123");
  });

  it("clears the token when set to null", () => {
    setAuthToken("abc123");
    setAuthToken(null);
    expect(getAuthToken()).toBeNull();
  });
});
