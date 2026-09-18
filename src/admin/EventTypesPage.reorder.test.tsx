import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "../test/server";
import EventTypesPage from "./EventTypesPage";
import type { EventType } from "../api/models";

const API_URL = import.meta.env.VITE_API_URL;

function makeEventType(id: string, title: string, position: number): EventType {
  return {
    id,
    coachId: "coach-1",
    title,
    description: null,
    durationMinutes: 30,
    locations: ["GOOGLE_MEET"],
    price: 0,
    position,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

const initialList = [
  makeEventType("a", "Első", 0),
  makeEventType("b", "Második", 1),
  makeEventType("c", "Harmadik", 2),
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <EventTypesPage />
    </QueryClientProvider>,
  );
}

function titlesInOrder(): string[] {
  return screen
    .getAllByRole("listitem")
    .map((li) => li.querySelector(".font-medium")?.textContent?.trim() ?? "");
}

describe("EventTypesPage reorder", () => {
  it("sends the new order to the atomic reorder endpoint and reflects it after refetch", async () => {
    const user = userEvent.setup();
    let currentList = initialList;
    let reorderBody: { ids: string[] } | undefined;

    server.use(
      http.get(`${API_URL}/event-types/mine`, () =>
        HttpResponse.json(currentList),
      ),
      http.patch(`${API_URL}/event-types/reorder`, async ({ request }) => {
        reorderBody = (await request.json()) as { ids: string[] };
        // Mirrors what the real backend does: persist the new order so the
        // next GET (triggered by the mutation's invalidateQueries) reflects it.
        currentList = reorderBody.ids.map(
          (id, index) =>
            ({
              ...initialList.find((et) => et.id === id)!,
              position: index,
            }) satisfies EventType,
        );
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderPage();
    await screen.findByText("Első");
    expect(titlesInOrder()).toEqual(["Első", "Második", "Harmadik"]);

    await user.click(
      screen.getAllByRole("button", { name: "Mozgatás lejjebb" })[0],
    );

    await waitFor(() => expect(reorderBody).toEqual({ ids: ["b", "a", "c"] }));
    await waitFor(() =>
      expect(titlesInOrder()).toEqual(["Második", "Első", "Harmadik"]),
    );
  });

  it("shows an error and leaves the list unchanged if the reorder call fails", async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${API_URL}/event-types/mine`, () =>
        HttpResponse.json(initialList),
      ),
      http.patch(`${API_URL}/event-types/reorder`, () =>
        HttpResponse.json(
          { statusCode: 400, message: "Váratlan hiba történt." },
          { status: 400 },
        ),
      ),
    );

    renderPage();
    await screen.findByText("Első");

    await user.click(
      screen.getAllByRole("button", { name: "Mozgatás lejjebb" })[0],
    );

    expect(
      await screen.findByText("Váratlan hiba történt."),
    ).toBeInTheDocument();
    // The list itself keeps showing the last known-good (server) order.
    expect(titlesInOrder()).toEqual(["Első", "Második", "Harmadik"]);
  });
});
