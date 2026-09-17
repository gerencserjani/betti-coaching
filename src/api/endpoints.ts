import { apiClient, ApiError, extractApiErrorMessage } from "./client";
import type {
  PublicEventType,
  Slot,
  BookingWithRelations,
  LoginResponse,
  Coach,
  EventType,
  WeeklyAvailability,
  AvailabilityOverride,
  Settings,
  GoogleStatus,
} from "./models";
import type { components } from "./types.generated";

// @nestjs/swagger's CLI plugin doesn't fully resolve `PartialType(CreateXDto)
// & {...}` compositions in the generated OpenAPI spec, so each generated
// Update*Dto request type is missing fields the backend actually accepts
// (confirmed via source for each use below). `Extra` covers fields present
// on the real Update*Dto but not on Create*Dto, e.g. EventType's `isActive`.
type PartialUpdateBody<
  CreateSchema extends keyof components["schemas"],
  Extra extends object = object,
> = Partial<components["schemas"][CreateSchema]> & Extra;

type UpdateEventTypeBody = PartialUpdateBody<
  "CreateEventTypeDto",
  { isActive?: boolean }
>;
type UpdateWeeklyAvailabilityBody =
  PartialUpdateBody<"CreateWeeklyAvailabilityDto">;
type UpdateAvailabilityOverrideBody =
  PartialUpdateBody<"CreateAvailabilityOverrideDto">;

async function unwrap<T>(
  promise: Promise<{ data?: unknown; error?: unknown }>,
): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new ApiError(extractApiErrorMessage(error));
  return data as T;
}

// ---------- Public (no auth) ----------

export const publicApi = {
  eventTypes: () => unwrap<PublicEventType[]>(apiClient.GET("/event-types")),

  slots: (params: { eventTypeId: string; from: string; to: string }) =>
    unwrap<Slot[]>(apiClient.GET("/slots", { params: { query: params } })),

  createBooking: (body: components["schemas"]["CreateBookingDto"]) =>
    unwrap<BookingWithRelations>(apiClient.POST("/bookings", { body })),

  getBookingByToken: (token: string) =>
    unwrap<BookingWithRelations>(
      apiClient.GET("/bookings/manage/{token}", {
        params: { path: { token } },
      }),
    ),

  cancelBookingByClient: (
    token: string,
    body: components["schemas"]["ClientCancelBookingDto"],
  ) =>
    unwrap<BookingWithRelations>(
      apiClient.PATCH("/bookings/manage/{token}/cancel", {
        params: { path: { token } },
        body,
      }),
    ),

  rescheduleBookingByClient: (
    token: string,
    body: components["schemas"]["RescheduleBookingDto"],
  ) =>
    unwrap<BookingWithRelations>(
      apiClient.PATCH("/bookings/manage/{token}/reschedule", {
        params: { path: { token } },
        body,
      }),
    ),
};

// ---------- Auth ----------

export const authApi = {
  login: (body: components["schemas"]["LoginDto"]) =>
    unwrap<LoginResponse>(apiClient.POST("/auth/login", { body })),

  me: () => unwrap<Coach>(apiClient.GET("/coaches/me")),
};

// ---------- Admin / coach (auth required) ----------

export const adminApi = {
  bookings: () => unwrap<BookingWithRelations[]>(apiClient.GET("/bookings")),

  cancelBooking: (
    id: string,
    body: components["schemas"]["CoachCancelBookingDto"],
  ) =>
    unwrap<BookingWithRelations>(
      apiClient.PATCH("/bookings/{id}/cancel", {
        params: { path: { id } },
        body,
      }),
    ),

  eventTypesMine: () => unwrap<EventType[]>(apiClient.GET("/event-types/mine")),

  createEventType: (body: components["schemas"]["CreateEventTypeDto"]) =>
    unwrap<EventType>(apiClient.POST("/event-types", { body })),

  updateEventType: (id: string, body: UpdateEventTypeBody) =>
    unwrap<EventType>(
      apiClient.PATCH("/event-types/{id}", {
        params: { path: { id } },
        // The generated request type only captures `isActive` -- see the
        // UpdateEventTypeBody comment above for why this cast is safe.
        body: body as components["schemas"]["UpdateEventTypeDto"],
      }),
    ),

  archiveEventType: (id: string) =>
    unwrap<EventType>(
      apiClient.DELETE("/event-types/{id}", { params: { path: { id } } }),
    ),

  deleteEventType: (id: string) =>
    unwrap<void>(
      apiClient.DELETE("/event-types/{id}/permanent", {
        params: { path: { id } },
      }),
    ),

  // One atomic backend transaction, unlike issuing one PATCH per item --
  // a partial failure there could leave the display order half-updated.
  reorderEventTypes: (ids: string[]) =>
    unwrap<void>(apiClient.PATCH("/event-types/reorder", { body: { ids } })),

  weeklyAvailability: () =>
    unwrap<WeeklyAvailability[]>(apiClient.GET("/availability/weekly")),

  createWeeklyAvailability: (
    body: components["schemas"]["CreateWeeklyAvailabilityDto"],
  ) =>
    unwrap<WeeklyAvailability>(
      apiClient.POST("/availability/weekly", { body }),
    ),

  updateWeeklyAvailability: (id: string, body: UpdateWeeklyAvailabilityBody) =>
    unwrap<WeeklyAvailability>(
      apiClient.PATCH("/availability/weekly/{id}", {
        params: { path: { id } },
        // Cast for the same reason as UpdateEventTypeBody above.
        body: body as components["schemas"]["UpdateWeeklyAvailabilityDto"],
      }),
    ),

  removeWeeklyAvailability: (id: string) =>
    unwrap<void>(
      apiClient.DELETE("/availability/weekly/{id}", {
        params: { path: { id } },
      }),
    ),

  overrides: () =>
    unwrap<AvailabilityOverride[]>(apiClient.GET("/availability/overrides")),

  createOverride: (
    body: components["schemas"]["CreateAvailabilityOverrideDto"],
  ) =>
    unwrap<AvailabilityOverride>(
      apiClient.POST("/availability/overrides", { body }),
    ),

  updateOverride: (id: string, body: UpdateAvailabilityOverrideBody) =>
    unwrap<AvailabilityOverride>(
      apiClient.PATCH("/availability/overrides/{id}", {
        params: { path: { id } },
        body: body as components["schemas"]["UpdateAvailabilityOverrideDto"],
      }),
    ),

  removeOverride: (id: string) =>
    unwrap<void>(
      apiClient.DELETE("/availability/overrides/{id}", {
        params: { path: { id } },
      }),
    ),

  coaches: () => unwrap<Coach[]>(apiClient.GET("/coaches")),

  createCoach: (body: components["schemas"]["CreateCoachDto"]) =>
    unwrap<Coach>(apiClient.POST("/coaches", { body })),

  updateMe: (body: components["schemas"]["UpdateCoachDto"]) =>
    unwrap<Coach>(apiClient.PATCH("/coaches/me", { body })),

  settings: () => unwrap<Settings>(apiClient.GET("/settings")),

  updateSettings: (body: components["schemas"]["UpdateSettingsDto"]) =>
    unwrap<Settings>(apiClient.PATCH("/settings", { body })),

  googleStatus: () =>
    unwrap<GoogleStatus>(apiClient.GET("/admin/google/status")),

  googleConnectState: () =>
    unwrap<{ state: string }>(apiClient.GET("/admin/google/connect-token")),
};
