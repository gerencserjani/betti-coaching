import { setupServer } from "msw/node";

// No default handlers -- each integration test registers exactly the
// endpoints it exercises via `server.use(...)`, so a missing handler fails
// loudly (MSW's onUnhandledRequest: "error") instead of silently letting a
// real network request through.
export const server = setupServer();
