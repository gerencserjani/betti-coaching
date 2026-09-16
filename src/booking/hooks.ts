import { useQuery } from "@tanstack/react-query";
import { publicApi } from "../api/endpoints";
import { getMonthRange } from "./dateUtils";

export function useEventTypes() {
  return useQuery({
    queryKey: ["event-types"],
    queryFn: publicApi.eventTypes,
  });
}

export function useMonthSlots(
  eventTypeId: string | null,
  year: number,
  month: number,
) {
  const { from, to } = getMonthRange(year, month);
  return useQuery({
    queryKey: ["slots", eventTypeId, from, to],
    queryFn: () => publicApi.slots({ eventTypeId: eventTypeId!, from, to }),
    enabled: !!eventTypeId,
  });
}

export function useBookingByToken(token: string | null) {
  return useQuery({
    queryKey: ["booking", "manage", token],
    queryFn: () => publicApi.getBookingByToken(token!),
    enabled: !!token,
    retry: false,
  });
}
