"use client";

import { Booking, Event, Train } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type BookingWithIncludes = Booking & {
  event?: Event | null;
  train?: Train | null;
};

async function fetchBookings(): Promise<BookingWithIncludes[]> {
  const response = await fetch("/api/bookings", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch bookings");
  }

  return response.json();
}

async function cancelBooking(bookingId: string): Promise<BookingWithIncludes> {
  const response = await fetch("/api/bookings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      bookingId,
      action: "cancel",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to cancel booking");
  }

  const result = await response.json();
  return result.booking;
}

export default function useBookings() {
  const queryClient = useQueryClient();

  const {
    data: bookings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
    staleTime: 5 * 60 * 1000,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  const getBookingDate = (booking: BookingWithIncludes) => {
    if (booking.event) return new Date(booking.event.date);
    if (booking.train) return new Date(booking.train.departure);
    return new Date(booking.time);
  };

  const upcomingBookings = bookings.filter((booking) => {
    if (booking.status === "CANCELLED") return false;
    return getBookingDate(booking) > new Date();
  });

  const pastBookings = bookings.filter((booking) => {
    return (
      getBookingDate(booking) <= new Date() || booking.status === "CANCELLED"
    );
  });

  return {
    bookings,
    upcomingBookings,
    pastBookings,
    isLoading,
    error,
    cancelBooking: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    cancelError: cancelMutation.error,
    refreshBookings: refetch,
  };
}
