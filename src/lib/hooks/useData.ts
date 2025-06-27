import { Event, EventCategory, Train } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type EventWithVendor = Event & {
  vendor: {
    id: string;
    name: string;
    imageUrl: string | null;
  } | null;
};

async function fetchEvents(
  category: EventCategory | "BOTH" = "BOTH",
  sortBy: "date" | "createdAt" = "date",
  take: number = 15,
): Promise<EventWithVendor[]> {
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

async function fetchEventById(id: string): Promise<EventWithVendor | null> {
  try {
    const response = await fetch(`/api/events?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch event: ${response.status}`);
    }
    const events = await response.json();
    return events[0] || null;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
}

async function fetchTrainById(id: string): Promise<Train | null> {
  try {
    const response = await fetch(`/api/trains?id=${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch train: ${response.status}`);
    }
    const trains = await response.json();
    return trains[0] || null;
  } catch (error) {
    console.error("Error fetching train:", error);
    throw error;
  }
}

async function fetchVendorEvents(): Promise<EventWithVendor[]> {
  try {
    const response = await fetch("/api/events?vendor=true", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch vendor events: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching vendor events:", error);
    return [];
  }
}

type VendorStats = {
  totalEvents: number;
  totalAttendees: number;
  totalRevenue: number;
};

async function fetchVendorStats(): Promise<VendorStats> {
  try {
    const response = await fetch("/api/events/stats", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch vendor stats: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching vendor stats:", error);
    return {
      totalEvents: 0,
      totalAttendees: 0,
      totalRevenue: 0,
    };
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
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrains(take: number = 25) {
  return useQuery({
    queryKey: ["trains", take],
    queryFn: () => fetchTrains(take),
    staleTime: 5 * 60 * 1000,
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

export function useEntityById<T extends { id: string }>(
  entityType: "event" | "train",
  id: string,
  searchQueries: string[][],
  fallbackFetch: (id: string) => Promise<T | null>,
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [entityType, id],
    queryFn: async () => {
      for (const queryPattern of searchQueries) {
        const queriesData = queryClient.getQueriesData({
          queryKey: queryPattern,
          exact: false,
        });

        for (const [, data] of queriesData) {
          if (Array.isArray(data)) {
            const found = (data as T[]).find((item) => item.id === id);
            if (found) {
              return found;
            }
          }
        }
      }

      return fallbackFetch(id);
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });
}

export function useConcertById(id: string) {
  return useEntityById<EventWithVendor>(
    "event",
    id,
    [
      ["events", "CONCERT"],
      ["events", "BOTH"],
    ],
    (id: string) =>
      fetchEventById(id).then((event) =>
        event?.category === "CONCERT" ? event : null,
      ),
  );
}

export function useMovieById(id: string) {
  return useEntityById<EventWithVendor>(
    "event",
    id,
    [
      ["events", "MOVIE"],
      ["events", "BOTH"],
    ],
    (id: string) =>
      fetchEventById(id).then((event) =>
        event?.category === "MOVIE" ? event : null,
      ),
  );
}

export function useTrainById(id: string) {
  return useEntityById<Train>("train", id, [["trains"]], fetchTrainById);
}

export function useVendorEvents() {
  return useQuery({
    queryKey: ["vendor-events"],
    queryFn: fetchVendorEvents,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVendorStats() {
  return useQuery({
    queryKey: ["vendor-stats"],
    queryFn: fetchVendorStats,
    staleTime: 5 * 60 * 1000,
  });
}

export { type VendorStats };
