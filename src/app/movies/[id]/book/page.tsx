"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import SeatGrid, { BookedSeat } from "@/components/ui/SeatGrid";
import StripePaymentForm from "@/components/ui/StripePaymentForm";
import { downloadTicket } from "@/lib/events/generateTicket";
import useAuth from "@/lib/hooks/useAuth";
import { useMovieById, useSeatsForEvent } from "@/lib/hooks/useData";
import { useSocket } from "@/lib/hooks/useSocket";
import { Booking } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";

export default function MovieBooking({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { data: movie, isLoading: movieLoading, error } = useMovieById(id);

  const [seats, setSeats] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const {
    data: seatData,
    isLoading: seatsLoading,
    error: seatsError,
    refetch: refetchSeats,
  } = useSeatsForEvent(
    movie?.id ?? null,
    selectedDate,
    selectedLocation,
    selectedShowtime,
  );

  const onSeatsBooked = useCallback(async () => {
    await refetchSeats();
  }, [refetchSeats]);

  const {
    seats: realTimeSeats,
    selectSeat,
    unselectSeat,
  } = useSocket({
    movieId: movie?.id ?? "",
    showtime: selectedShowtime ?? "",
    date: selectedDate ?? "",
    location: selectedLocation ?? "",
    userId: user?.id ?? "",
    serverUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:4000",
    onSeatsBooked,
  });

  useEffect(() => {
    const dateParam = searchParams.get("date");
    const locationParam = searchParams.get("location");
    const showtimeParam = searchParams.get("showtime");
    if (dateParam) {
      setSelectedDate(dateParam);
    }
    if (locationParam) {
      setSelectedLocation(locationParam);
    }
    if (showtimeParam) {
      setSelectedShowtime(showtimeParam);
    }
  }, [searchParams]);

  const totalPrice = movie ? seats * movie.price : 0;

  const incrementSeats = () => {
    if (seats < 10) setSeats(seats + 1);
  };

  const decrementSeats = () => {
    if (seats > 1) setSeats(seats - 1);
  };

  const getBookingTime = () => {
    if (!selectedDate || !selectedShowtime) return "";
    const date = new Date(selectedDate);
    const time = new Date(selectedShowtime);
    date.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return date.toISOString();
  };

  // Helper to determine if a seat is selected by another user
  const isSeatSelectedByOther = (seatId: string) => {
    return realTimeSeats[seatId] && realTimeSeats[seatId] !== user?.id;
  };

  // Update local selection and emit socket events
  const handleSelectSeat = (seatId: string) => {
    if (isSeatSelectedByOther(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
      unselectSeat(seatId);
    } else if (selectedSeats.length < seats) {
      setSelectedSeats([...selectedSeats, seatId]);
      selectSeat(seatId);
    }
  };

  // Compute heldSeats: seats held by others (not booked, not selected by this user)
  const heldSeats = Object.entries(realTimeSeats)
    .filter(
      ([seatId, holderId]) =>
        holderId !== user?.id && !selectedSeats.includes(seatId),
    )
    .map(([seatId]) => seatId);

  const handleBooking = async () => {
    if (
      !movie ||
      !user ||
      !selectedDate ||
      !selectedLocation ||
      !selectedShowtime
    )
      return;

    setIsBooking(true);
    setBookingError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          eventId: movie.id,
          quantity: seats,
          totalPrice,
          time: getBookingTime(),
          date: selectedDate,
          location: selectedLocation,
          showtime: selectedShowtime,
          seatIds: selectedSeats,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      const bookingData = await response.json();
      const bookingId = bookingData.booking.id;

      const bookingResponse = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!bookingResponse.ok) {
        throw new Error("Failed to fetch booking details");
      }

      const fullBooking: Booking = await bookingResponse.json();
      setCreatedBooking(fullBooking);
      setBookingSuccess(true);

      try {
        const emailResponse = await fetch("/api/bookings/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: fullBooking.id,
            userId: user.id,
          }),
          credentials: "include",
        });

        if (!emailResponse.ok) {
          console.error("Failed to send confirmation email");
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
    } catch (error) {
      setBookingError(
        error instanceof Error ? error.message : "Booking failed",
      );
    } finally {
      setIsBooking(false);
    }
  };

  const handleDownloadTicket = async () => {
    if (!movie || !user || !createdBooking) return;

    setIsDownloadingPDF(true);
    try {
      const seatsResponse = await fetch(
        `/api/bookings/seats?bookingId=${createdBooking.id}`,
      );
      const seatsData = await seatsResponse.json();
      const result = await downloadTicket({
        event: movie,
        user: user,
        booking: createdBooking,
        seats: seatsData.seats || [],
      });

      if (!result.success) {
        console.error("Failed to generate PDF:", result.error);
      }
    } catch (error) {
      console.error("Error downloading ticket:", error);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleStripeSuccess = async (booking: Booking) => {
    setCreatedBooking(booking);
    setBookingSuccess(true);

    if (user) {
      try {
        const emailResponse = await fetch("/api/bookings/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: booking.id,
            userId: user.id,
          }),
          credentials: "include",
        });

        if (!emailResponse.ok) {
          console.error("Failed to send confirmation email");
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
      }
    }
  };

  const handleStripeError = (error: string) => {
    setBookingError(error);
  };

  if (authLoading || movieLoading) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
        <div className="flex w-full flex-col gap-8 p-12">
          <LoadingIndicator text="Loading..." />
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
        <div className="flex w-full flex-col gap-8 p-12">
          <div className="mx-auto max-w-md text-center">
            <div className="font-anek mb-6 rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-900/20 to-gray-900/80 p-8 backdrop-blur-sm">
              <div className="mb-6">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm">
                  <svg
                    className="h-8 w-8 text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="font-anek mb-3 bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-2xl font-bold text-transparent">
                Authentication Required
              </h2>
              <p className="font-anek mb-6 text-lg text-gray-300">
                You need to be logged in to book movie tickets.
              </p>
              <div className="space-y-3">
                <Link
                  href={`/login?redirect=/movies/${id}/book?date=${selectedDate}&location=${selectedLocation}&showtime=${selectedShowtime}`}
                  className="block w-full rounded-xl bg-gradient-to-r from-purple-600/80 to-pink-600/80 px-6 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-purple-500/80 hover:to-pink-500/80 focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
                >
                  Login
                </Link>
                <Link
                  href={`/register?redirect=/movies/${id}/book?date=${selectedDate}&location=${selectedLocation}&showtime=${selectedShowtime}`}
                  className="block w-full rounded-xl border border-gray-600/50 bg-gray-800/50 px-6 py-3 font-medium text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-500/50 hover:bg-gray-700/50 focus:ring-2 focus:ring-gray-500/30 focus:outline-none"
                >
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
        <div className="flex w-full flex-col gap-8 p-12">
          <ErrorMessage message="Movie not found" />
        </div>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
        <div className="flex w-full flex-col gap-8 p-12">
          <div className="mx-auto max-w-md text-center">
            <div className="font-anek mb-6 rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-900/20 to-gray-900/80 p-8 backdrop-blur-sm">
              <div className="mb-6">
                <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20 backdrop-blur-sm">
                  <svg
                    className="h-8 w-8 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="font-anek mb-3 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-2xl font-bold text-transparent">
                Booking Confirmed!
              </h2>
              <p className="mb-6 text-lg text-gray-300">
                Your tickets for {movie.title} have been booked successfully.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadTicket}
                  disabled={isDownloadingPDF}
                  className="block w-full cursor-pointer rounded-xl bg-gradient-to-r from-green-600/80 to-emerald-600/80 px-6 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-green-500/80 hover:to-emerald-500/80 focus:ring-2 focus:ring-green-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isDownloadingPDF ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-5 w-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating PDF...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Download Ticket PDF
                    </span>
                  )}
                </button>
                <Link
                  href={`/movies/${movie.id}`}
                  className="block w-full cursor-pointer rounded-xl bg-gradient-to-r from-purple-600/80 to-pink-600/80 px-6 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-purple-500/80 hover:to-pink-500/80 focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
                >
                  Back to Movie
                </Link>
                <Link
                  href="/movies"
                  className="block w-full cursor-pointer rounded-xl border border-gray-600/50 bg-gray-800/50 px-6 py-3 font-medium text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-500/50 hover:bg-gray-700/50 focus:ring-2 focus:ring-gray-500/30 focus:outline-none"
                >
                  Browse More Movies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-gray-900">
      <div className="relative px-4 py-12 sm:px-6">
        <div className="mx-auto mb-12 max-w-6xl text-center">
          <h1 className="font-anek mb-4 text-4xl font-bold text-white md:text-5xl">
            Secure Your Spot
          </h1>
          <p className="font-anek text-lg text-gray-400">
            Complete your booking for this amazing experience
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 backdrop-blur-sm">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={movie.imageUrl || "/movie.jpg"}
                    alt={movie.title}
                    fill
                    className="object-cover select-none"
                  />
                </div>
                <h2 className="font-anek mb-3 text-3xl font-bold text-white lg:text-4xl">
                  {movie.title}
                </h2>
                <p className="font-anek mb-4 text-lg leading-relaxed text-gray-300">
                  {movie.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
                <div className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-4 text-center">
                  <div className="mb-3 flex items-center justify-center">
                    <div className="rounded-full border border-orange-500/30 bg-orange-600/20 p-2">
                      <svg
                        className="h-5 w-5 text-orange-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-anek mb-1 text-sm font-bold text-white">
                    Showtime
                  </h3>
                  <p className="font-anek text-lg font-bold text-orange-400">
                    {selectedShowtime
                      ? new Date(selectedShowtime).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "Not selected"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-4 text-center">
                  <div className="mb-3 flex items-center justify-center">
                    <div className="rounded-full border border-emerald-500/30 bg-emerald-600/20 p-2">
                      <svg
                        className="h-5 w-5 text-emerald-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-anek mb-1 text-sm font-bold text-white">
                    Theatre
                  </h3>
                  <p className="font-anek text-lg font-bold text-emerald-400">
                    {selectedLocation || "Not selected"}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-4 text-center">
                  <div className="mb-3 flex items-center justify-center">
                    <div className="rounded-full border border-blue-500/30 bg-blue-600/20 p-2">
                      <svg
                        className="h-5 w-5 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-anek mb-1 text-sm font-bold text-white">
                    Date
                  </h3>
                  <p className="font-anek text-lg font-bold text-blue-400">
                    {selectedDate
                      ? new Date(selectedDate).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })
                      : "Select a showtime"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 backdrop-blur-sm">
              <h3 className="font-anek mb-6 text-xl font-bold text-white">
                Select Date
              </h3>

              <div className="flex flex-wrap justify-between gap-4">
                {movie.dateArr.map((date, index) => {
                  const dateString = new Date(date).toISOString();
                  const isSelected = selectedDate === dateString;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(dateString)}
                      className={`min-w-[200px] flex-1 cursor-pointer rounded-xl border p-6 text-center transition-all duration-300 ${
                        isSelected
                          ? "border-blue-500/50 bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm"
                          : "border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-blue-500/30 hover:from-blue-600/10 hover:to-blue-800/10"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-center">
                        <div
                          className={`rounded-full border p-2 ${
                            isSelected
                              ? "border-blue-500/50 bg-blue-600/30"
                              : "border-blue-500/30 bg-blue-600/20"
                          }`}
                        >
                          <svg
                            className="h-5 w-5 text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="font-anek text-lg font-bold text-blue-400">
                        {new Date(date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <p className="font-anek mt-1 text-sm text-gray-400">
                        {new Date(date).toLocaleDateString("en-US", {
                          year: "numeric",
                        })}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 backdrop-blur-sm">
              <h3 className="font-anek mb-6 text-xl font-bold text-white">
                Select Location
              </h3>

              <div className="flex flex-wrap justify-between gap-4">
                {movie.locationArr.map((location, index) => {
                  const isSelected = selectedLocation === location;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedLocation(location)}
                      className={`min-w-[200px] flex-1 cursor-pointer rounded-xl border p-6 text-center transition-all duration-300 ${
                        isSelected
                          ? "border-emerald-500/50 bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 backdrop-blur-sm"
                          : "border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-emerald-500/30 hover:from-emerald-600/10 hover:to-emerald-800/10"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-center">
                        <div
                          className={`rounded-full border p-2 ${
                            isSelected
                              ? "border-emerald-500/50 bg-emerald-600/30"
                              : "border-emerald-500/30 bg-emerald-600/20"
                          }`}
                        >
                          <svg
                            className="h-5 w-5 text-emerald-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="font-anek text-lg font-bold text-emerald-400">
                        {location}
                      </div>
                      <p className="font-anek mt-1 text-sm text-gray-400">
                        Cinema hall
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 backdrop-blur-sm">
              <h3 className="font-anek mb-6 text-xl font-bold text-white">
                Select Showtime
              </h3>

              <div className="flex flex-wrap justify-between gap-4">
                {movie.showtimes.map((time, index) => {
                  const timeString = new Date(time).toISOString();
                  const isSelected = selectedShowtime === timeString;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedShowtime(timeString)}
                      className={`min-w-[200px] flex-1 cursor-pointer rounded-xl border p-6 text-center transition-all duration-300 ${
                        isSelected
                          ? "border-orange-500/50 bg-gradient-to-br from-orange-600/20 to-orange-800/20 backdrop-blur-sm"
                          : "border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-orange-500/30 hover:from-orange-600/10 hover:to-orange-800/10"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-center">
                        <div
                          className={`rounded-full border p-2 ${
                            isSelected
                              ? "border-orange-500/50 bg-orange-600/30"
                              : "border-orange-500/30 bg-orange-600/20"
                          }`}
                        >
                          <svg
                            className="h-5 w-5 text-orange-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="font-anek text-lg font-bold text-orange-400">
                        {new Date(time).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </div>
                      <p className="font-anek mt-1 text-sm text-gray-400">
                        Show starts
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate &&
              selectedLocation &&
              selectedShowtime &&
              (seatsLoading ? (
                <LoadingIndicator text="Loading seats..." />
              ) : seatsError ? (
                <ErrorMessage message="Failed to load seats." />
              ) : seatData && seatData.length >= 0 ? (
                <div className="mb-8">
                  <SeatGrid
                    bookedSeats={seatData as BookedSeat[]}
                    selectedSeats={selectedSeats}
                    heldSeats={heldSeats}
                    seatLimit={seats}
                    onSelect={handleSelectSeat}
                  />
                </div>
              ) : null)}

            <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 backdrop-blur-sm">
              <h3 className="font-anek mb-6 text-xl font-bold text-white">
                Your Details
              </h3>

              <div className="flex items-center justify-between">
                <span className="font-anek text-lg font-medium text-white">
                  Number of seats:
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={decrementSeats}
                    disabled={seats <= 1}
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-700/80 to-gray-800/80 text-white backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:from-gray-600/80 hover:to-gray-700/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-gray-700/80 disabled:hover:to-gray-800/80"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 12H4"
                      />
                    </svg>
                  </button>

                  <span className="font-anek min-w-[4rem] text-center text-2xl font-bold text-white">
                    {seats}
                  </span>

                  <button
                    onClick={incrementSeats}
                    disabled={seats >= 10}
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-700/80 to-gray-800/80 text-white backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:from-gray-600/80 hover:to-gray-700/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-gray-700/80 disabled:hover:to-gray-800/80"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="font-anek mt-6 rounded-xl border border-gray-600/30 bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 backdrop-blur-sm">
                <div className="flex justify-between text-base">
                  <span className="text-gray-300">Price per seat:</span>
                  <span className="font-medium text-white">
                    ₹{movie.price.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 flex justify-between text-2xl font-bold">
                  <span className="text-white">Total:</span>
                  <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 backdrop-blur-sm">
              <h3 className="font-anek mb-6 text-xl font-bold text-white">
                Payment Method
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                    paymentMethod === "card"
                      ? "border-blue-500/50 bg-gradient-to-br from-blue-600/20 to-blue-800/20 backdrop-blur-sm"
                      : "border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-blue-500/30 hover:from-blue-600/10 hover:to-blue-800/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-full border p-2 ${
                        paymentMethod === "card"
                          ? "border-blue-500/50 bg-blue-600/30"
                          : "border-blue-500/30 bg-blue-600/20"
                      }`}
                    >
                      <svg
                        className="h-5 w-5 text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-anek text-lg font-bold text-white">
                        Credit/Debit Card
                      </h4>
                      <p className="font-anek text-sm text-gray-400">
                        Secure payment with your card
                      </p>
                    </div>
                    {paymentMethod === "card" && (
                      <div className="h-3 w-3 rounded-full bg-blue-400"></div>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("wallet")}
                  className={`cursor-pointer rounded-xl border p-4 transition-all duration-300 ${
                    paymentMethod === "wallet"
                      ? "border-green-500/50 bg-gradient-to-br from-green-600/20 to-green-800/20 backdrop-blur-sm"
                      : "border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-green-500/30 hover:from-green-600/10 hover:to-green-800/10"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`rounded-full border p-2 ${
                        paymentMethod === "wallet"
                          ? "border-green-500/50 bg-green-600/30"
                          : "border-green-500/30 bg-green-600/20"
                      }`}
                    >
                      <svg
                        className="h-5 w-5 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <h4 className="font-anek text-lg font-bold text-white">
                        Wallet Balance
                      </h4>
                      <p className="font-anek text-sm font-medium text-green-400">
                        ₹{(user?.balance ?? 0).toFixed(2)} available
                      </p>
                    </div>
                    {paymentMethod === "wallet" && (
                      <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    )}
                  </div>
                </button>
              </div>

              {paymentMethod === "wallet" &&
                user &&
                (user.balance ?? 0) < totalPrice && (
                  <div className="mt-3 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-900/20 to-gray-900/80 p-3 backdrop-blur-sm">
                    <p className="font-anek text-sm font-medium text-red-400">
                      Insufficient wallet balance. Please add funds or use a
                      different payment method.
                    </p>
                  </div>
                )}
            </div>

            {bookingError && (
              <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-900/20 to-gray-900/80 p-4 backdrop-blur-sm">
                <p className="font-anek font-medium text-red-400">
                  {bookingError}
                </p>
              </div>
            )}

            {paymentMethod === "wallet" && (
              <button
                onClick={handleBooking}
                disabled={
                  isBooking ||
                  !selectedDate ||
                  !selectedLocation ||
                  !selectedShowtime ||
                  !!(
                    paymentMethod === "wallet" &&
                    user &&
                    (user.balance ?? 0) < totalPrice
                  )
                }
                className="font-anek w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-blue-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-blue-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {isBooking ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="h-5 w-5 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay with Wallet - ₹${totalPrice.toFixed(2)}`
                )}
              </button>
            )}

            {paymentMethod === "card" && (
              <div className="mt-6">
                <StripePaymentForm
                  amount={totalPrice}
                  eventId={movie.id}
                  quantity={seats}
                  time={getBookingTime()}
                  location={selectedLocation || undefined}
                  seatIds={selectedSeats}
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
