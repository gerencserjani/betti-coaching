// Hand-written response types. The backend's OpenAPI spec (src/api/types.generated.ts)
// only documents request bodies/params accurately -- response schemas are generic
// (`content?: never`) since they aren't backed by dedicated DTO classes on the
// backend. These interfaces mirror the backend's actual Prisma models + service
// return shapes exactly (verified against betti-coaching-calendar's source).

export type LocationType = "IN_PERSON" | "GOOGLE_MEET" | "PHONE";
export type BookingStatus = "CONFIRMED" | "CANCELLED";
export type CancelledBy = "CLIENT" | "COACH";
export type CoachRole = "ADMIN" | "COACH";
export type Locale = "hu" | "en";

export interface Coach {
  id: string;
  email: string;
  name: string;
  preferredLocale: Locale;
  role: CoachRole;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  coach: Coach;
}

export interface EventType {
  id: string;
  coachId: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  locations: LocationType[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** GET /event-types (public) includes only a partial coach. */
export interface PublicEventType extends EventType {
  coach: { id: string; name: string };
}

export interface Slot {
  coachId: string;
  /** ISO datetime, UTC */
  startAt: string;
  /** ISO datetime, UTC */
  endAt: string;
}

export interface Booking {
  id: string;
  eventTypeId: string;
  coachId: string;
  startAt: string;
  endAt: string;
  location: LocationType;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientNote: string | null;
  locale: Locale;
  status: BookingStatus;
  cancelledBy: CancelledBy | null;
  cancellationReason: string | null;
  manageToken: string;
  googleEventId: string | null;
  meetLink: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingWithRelations extends Booking {
  eventType: EventType;
  coach: Coach;
}

export interface WeeklyAvailability {
  id: string;
  coachId: string;
  /** ISO weekday: 1 = Monday ... 7 = Sunday */
  weekday: number;
  /** Minutes since midnight, business timezone */
  startMinute: number;
  endMinute: number;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityOverride {
  id: string;
  coachId: string;
  /** "YYYY-MM-DD" */
  date: string;
  isUnavailable: boolean;
  startMinute: number | null;
  endMinute: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  id: "singleton";
  businessAddress: string;
  cancellationNoticeHours: number;
  businessTimezone: string;
  updatedAt: string;
}

export interface GoogleStatus {
  connected: boolean;
  connectedEmail?: string;
  connectedAt?: string;
}
