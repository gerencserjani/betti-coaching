import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "../test/server";
import BookingWizard from "./BookingWizard";
import type {
  BookingWithRelations,
  PublicEventType,
  Slot,
} from "../api/models";
// Real i18n setup -- this is an end-to-end flow through many components that
// all read real translation keys, so a per-key mock would be more work than
// value here (unlike the single-component BookingForm unit test).
import i18n from "../i18n";

const API_URL = import.meta.env.VITE_API_URL;

const eventType: PublicEventType = {
  id: "et-1",
  coachId: "coach-1",
  title: "Első konzultáció",
  description: null,
  durationMinutes: 30,
  locations: ["GOOGLE_MEET"],
  price: 0,
  position: 0,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  coach: { id: "coach-1", name: "Teszt Coach" },
};

// Local noon on the 20th, well clear of any timezone-driven date-boundary
// flakiness, converted to whatever UTC instant that actually is by the test
// runner's own local timezone -- exactly what the real API would send.
const slotStart = new Date(2026, 5, 20, 10, 0, 0);
const slotEnd = new Date(2026, 5, 20, 10, 30, 0);
const slot: Slot = {
  coachId: "coach-1",
  startAt: slotStart.toISOString(),
  endAt: slotEnd.toISOString(),
};

function renderWizard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <BookingWizard />
    </QueryClientProvider>,
  );
}

beforeEach(async () => {
  // jsdom's navigator.language ("en-US") otherwise wins the language
  // detector's fallback chain, rendering the whole flow in English --
  // this is a Hungarian site, and the fixture text below is Hungarian.
  await i18n.changeLanguage("hu");
  vi.useFakeTimers({ shouldAdvanceTime: true });
  // Fixed "today" well before the fixture slot, so it never becomes past.
  vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("BookingWizard", () => {
  it("shows the unavailable notice when the backend can't be reached", async () => {
    server.use(http.get(`${API_URL}/event-types`, () => HttpResponse.error()));
    renderWizard();

    expect(
      await screen.findByText(/nem elérhető/i, {}, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it("completes a full booking: pick a day, pick a time, fill the form, submit", async () => {
    const user = userEvent.setup({
      advanceTimers: (ms) => vi.advanceTimersByTime(ms),
    });

    let createdBookingBody: unknown;
    server.use(
      http.get(`${API_URL}/event-types`, () => HttpResponse.json([eventType])),
      http.get(`${API_URL}/slots`, () => HttpResponse.json([slot])),
      http.post(`${API_URL}/bookings`, async ({ request }) => {
        createdBookingBody = await request.json();
        const booking: BookingWithRelations = {
          id: "booking-1",
          eventTypeId: eventType.id,
          coachId: "coach-1",
          startAt: slot.startAt,
          endAt: slot.endAt,
          location: "GOOGLE_MEET",
          clientName: "Teszt Elek",
          clientEmail: "teszt@example.com",
          clientPhone: "+36301234567",
          clientNote: null,
          locale: "hu",
          status: "CONFIRMED",
          cancelledBy: null,
          cancellationReason: null,
          manageToken: "token-1",
          googleEventId: null,
          meetLink: "https://meet.google.com/abc-defg-hij",
          createdAt: "2026-06-01T09:00:00.000Z",
          updatedAt: "2026-06-01T09:00:00.000Z",
          eventType,
          coach: {
            id: "coach-1",
            name: "Teszt Coach",
            email: "coach@example.com",
            role: "ADMIN",
            preferredLocale: "hu",
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        };
        return HttpResponse.json(booking, { status: 201 });
      }),
    );

    renderWizard();

    // Only one event type/location -> the wizard skips straight to the
    // calendar, so the summary card should already show the service.
    await screen.findByText("Első konzultáció");

    // Navigate isn't needed -- "today" is already June 2026, the fixture
    // month. Click day 20, the only day with slots.
    const dayButton = await screen.findByRole("button", { name: "20" });
    await user.click(dayButton);

    const timeButton = await screen.findByRole("button", {
      name: /10:00/,
    });
    await user.click(timeButton);

    // Fill in the details form.
    const [nameInput, emailInput] = screen.getAllByRole("textbox");
    await user.type(nameInput, "Teszt Elek");
    await user.type(emailInput, "teszt@example.com");
    const phoneField =
      document.querySelector<HTMLInputElement>(".phone-input input")!;
    await user.type(phoneField, "301234567");

    const submitButton = screen.getByRole("button", {
      name: /időpont lefoglalása|foglalás/i,
    });
    await waitFor(() => expect(submitButton).toBeEnabled());
    await user.click(submitButton);

    // Confirmation screen replaces the wizard entirely.
    await waitFor(() =>
      expect(screen.getByText("Első konzultáció")).toBeInTheDocument(),
    );
    expect(
      screen.getByRole("heading", { name: /foglalás megerősítve/i }),
    ).toBeInTheDocument();

    expect(createdBookingBody).toMatchObject({
      eventTypeId: "et-1",
      location: "GOOGLE_MEET",
      clientName: "Teszt Elek",
      clientEmail: "teszt@example.com",
      clientPhone: "+36301234567",
    });
  });

  it("shows a friendly error and stays on the form if booking creation fails", async () => {
    const user = userEvent.setup({
      advanceTimers: (ms) => vi.advanceTimersByTime(ms),
    });
    server.use(
      http.get(`${API_URL}/event-types`, () => HttpResponse.json([eventType])),
      http.get(`${API_URL}/slots`, () => HttpResponse.json([slot])),
      http.post(`${API_URL}/bookings`, () =>
        HttpResponse.json(
          { statusCode: 409, message: "Ezt az időpontot már lefoglalták." },
          { status: 409 },
        ),
      ),
    );

    renderWizard();
    await screen.findByText("Első konzultáció");

    await user.click(await screen.findByRole("button", { name: "20" }));
    await user.click(await screen.findByRole("button", { name: /10:00/ }));

    const [nameInput, emailInput] = screen.getAllByRole("textbox");
    await user.type(nameInput, "Teszt Elek");
    await user.type(emailInput, "teszt@example.com");
    const phoneField =
      document.querySelector<HTMLInputElement>(".phone-input input")!;
    await user.type(phoneField, "301234567");

    const submitButton = screen.getByRole("button", {
      name: /időpont lefoglalása|foglalás/i,
    });
    await waitFor(() => expect(submitButton).toBeEnabled());
    await user.click(submitButton);

    expect(
      await screen.findByText("Ezt az időpontot már lefoglalták."),
    ).toBeInTheDocument();
    // Still on the form, not silently reset or stuck on a confirmation.
    expect(nameInput).toBeInTheDocument();
  });
});
