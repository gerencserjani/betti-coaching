import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach } from "vitest";
import { server } from "./server";
import { initI18n } from "../i18n.ts";
import hu from "./fixtures/hu.json";
import en from "./fixtures/en.json";

// RTL's auto-cleanup registration relies on a Jest-style global `afterEach`,
// which isn't present here since `test.globals` is off (explicit imports
// instead) -- register it manually so each test starts from an empty DOM.
afterEach(cleanup);

// This package has no app of its own to call initI18n() from -- a real app
// supplies its own locale content, but component tests here need *some*
// real translations to assert against, so this is a fixture copy (not
// Betti's actual content, even though it started from it) that every test
// file shares, initialized once for the whole run.
initI18n({ hu, en, siteUrl: "http://localhost:5173" });

// Started as a plain top-level side effect, NOT inside beforeAll -- this
// setup file is imported (so this line runs) before the test file's own
// imports are evaluated, but a beforeAll hook (wherever it's registered)
// only runs after every file's imports across the whole run have already
// resolved. openapi-fetch's createClient() captures a reference to
// globalThis.fetch once, at import time, so listen() must patch that global
// before the test file imports the api client, not after.
server.listen({ onUnhandledRequest: "error" });
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
