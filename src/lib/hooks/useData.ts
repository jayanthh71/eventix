import { Event, EventCategory, Train } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

async function fetchEvents(
  category: EventCategory | "BOTH" = "BOTH",
  sortBy: "date" | "createdAt" = "date",
  take: number = 15,
): Promise<Event[]> {
  try {
    const params = new URLSearchParams({
      category: category,
      sortBy,
      take: take.toString(),
    });

    const response = await fetch(`/api/events?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

async function fetchTrains(take: number = 25): Promise<Train[]> {
  try {
    const params = new URLSearchParams({
      take: take.toString(),
    });

    const response = await fetch(`/api/trains?${params}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch trains: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching trains:", error);
    return [];
  }
}

export function useEvents(
  category: EventCategory | "BOTH" = "BOTH",
  sortBy: "date" | "createdAt" = "date",
  take: number = 15,
) {
  return useQuery({
    queryKey: ["events", category, sortBy, take],
    queryFn: () => fetchEvents(category, sortBy, take),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrains(take: number = 25) {
  return useQuery({
    queryKey: ["trains", take],
    queryFn: () => fetchTrains(take),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMovies(take: number = 25) {
  return useEvents("MOVIE", "createdAt", take);
}

export function useConcerts(take: number = 25) {
  return useEvents("CONCERT", "createdAt", take);
}

export function useUpcomingEvents(
  category: EventCategory | "BOTH" = "BOTH",
  take: number = 8,
) {
  return useEvents(category, "date", take);
}
