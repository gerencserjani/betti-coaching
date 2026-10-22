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
  // The backend has no other way to know which coach's data an anonymous
  // request is for (see backend issue #14) -- every frontend deployment is
  // configured with its own VITE_COACH_ID and sends it on every public call.
  eventTypes: () =>
    unwrap<PublicEventType[]>(
      apiClient.GET("/event-types", {
        params: { query: { coachId: import.meta.env.VITE_COACH_ID } },
      }),
    ),

  // GET /settings has no auth guard -- the public booking page already
  // relies on this for the business address/timezone.
  settings: () =>
    unwrap<Settings>(
      apiClient.GET("/settings", {
        params: { query: { coachId: import.meta.env.VITE_COACH_ID } },
      }),
    ),

  slots: (params: {
    eventTypeId: string;
    from: string;
    to: string;
    excludeBookingId?: string;
  }) => unwrap<Slot[]>(apiClient.GET("/slots", { params: { query: params } })),

  // The generated type demands an explicit origin/referer header pair,
  // matching the backend's @Headers('origin')/@Headers('referer') params
  // (used to stamp Booking.originUrl) -- but those are both optional at
  // runtime there, and Origin is a forbidden header name a fetch() call
  // can't actually override anyway (the browser sets the real one
  // regardless of what's passed here). This just satisfies the type; the
  // @nestjs/swagger CLI plugin not marking them optional in the generated
  // spec is the same class of imprecision noted on PartialUpdateBody above.
  createBooking: (body: components["schemas"]["CreateBookingDto"]) =>
    unwrap<BookingWithRelations>(
      apiClient.POST("/bookings", {
        body,
        params: { header: { origin: "", referer: "" } },
      }),
    ),

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

  // Public: redeems a coach-invite token (see coach-calendar's
  // CoachesService.acceptInvite) -- creates the Coach for the first time
  // and logs her straight in, same response shape as login().
  acceptInvite: (body: components["schemas"]["AcceptInviteDto"]) =>
    unwrap<LoginResponse>(apiClient.POST("/coaches/accept-invite", { body })),

  // Public, always resolves (204) whether or not the email has an account --
  // see AuthService.forgotPassword()'s own comment for why. The empty
  // origin/referer header values are the same type-satisfying no-op as
  // publicApi.createBooking above -- the backend reads the browser's real
  // headers regardless of what's passed here.
  forgotPassword: (body: components["schemas"]["ForgotPasswordDto"]) =>
    unwrap<void>(
      apiClient.POST("/auth/forgot-password", {
        body,
        params: { header: { origin: "", referer: "" } },
      }),
    ),

  // Public: redeems a password-reset token -- same response shape as login().
  resetPassword: (body: components["schemas"]["ResetPasswordDto"]) =>
    unwrap<LoginResponse>(apiClient.POST("/auth/reset-password", { body })),
};

// ---------- Admin / coach (auth required) ----------

export const adminApi = {
  // Tells the backend which coach's site this is (see backend issue #27) --
  // a plain coach is always restricted to their own data regardless, but
  // this is what lets an ADMIN visiting one coach's admin dashboard see
  // only that coach's data instead of every coach's.
  bookings: () =>
    unwrap<BookingWithRelations[]>(
      apiClient.GET("/bookings", {
        params: { query: { coachId: import.meta.env.VITE_COACH_ID } },
      }),
    ),

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

  eventTypesMine: () =>
    unwrap<EventType[]>(
      apiClient.GET("/event-types/mine", {
        params: { query: { coachId: import.meta.env.VITE_COACH_ID } },
      }),
    ),

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
    unwrap<WeeklyAvailability[]>(
      apiClient.GET("/availability/weekly", {
        params: { query: { coachId: import.meta.env.VITE_COACH_ID } },
      }),
    ),

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
    unwrap<AvailabilityOverride[]>(
      apiClient.GET("/availability/overrides", {
        params: { query: { coachId: import.meta.env.VITE_COACH_ID } },
      }),
    ),

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

  updateMe: (body: components["schemas"]["UpdateCoachDto"]) =>
    unwrap<Coach>(apiClient.PATCH("/coaches/me", { body })),

  // GET /settings is the same public, unauthenticated endpoint publicApi
  // uses -- the data isn't sensitive, so no auth is needed here, just the
  // caller's own coachId (see publicApi.settings above for why).
  settings: (coachId: string) =>
    unwrap<Settings>(
      apiClient.GET("/settings", { params: { query: { coachId } } }),
    ),

  updateSettings: (body: components["schemas"]["UpdateSettingsDto"]) =>
    unwrap<Settings>(apiClient.PATCH("/settings", { body })),

  googleStatus: () =>
    unwrap<GoogleStatus>(apiClient.GET("/admin/google/status")),

  googleConnectState: () =>
    unwrap<{ state: string }>(apiClient.GET("/admin/google/connect-token")),
};
