import { previewTicket } from "@/lib/events/generateTicket";
import Image from "next/image";
import { useState } from "react";

export default function BookingCard({
  booking,
  onCancel,
  isCancelling = false,
}: {
  booking: {
    id: string;
    quantity: number;
    totalPrice: number;
    time: string;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    createdAt: string;
    location?: string;
    event?: {
      title: string;
      date: string;
      location: string;
      locationArr: string[];
      dateArr?: string[];
      imageUrl?: string;
      category: "MOVIE" | "CONCERT";
    };
    train?: {
      name: string;
      number: string;
      departure: string;
      arrival: string;
      from: string;
      to: string;
      imageUrl?: string;
    };
  };
  onCancel?: (bookingId: string) => void;
  isCancelling?: boolean;
}) {
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  const isEvent = !!booking.event;
  const isTrain = !!booking.train;
  const isMovie = isEvent && booking.event?.category === "MOVIE";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-600/90 text-white shadow-lg backdrop-blur-sm";
      case "PENDING":
        return "bg-yellow-600/90 text-white shadow-lg backdrop-blur-sm";
      case "CANCELLED":
        return "bg-red-600/90 text-white shadow-lg backdrop-blur-sm";
      default:
        return "bg-gray-600/90 text-white shadow-lg backdrop-blur-sm";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const isUpcomingEvent = () => {
    if (!isEvent || !booking.event) return false;
    const eventDate = new Date(booking.event.date);
    const now = new Date();
    return eventDate > now;
  };

  const isUpcomingTrain = () => {
    if (!isTrain || !booking.train) return false;
    const trainDate = new Date(booking.train.departure);
    const now = new Date();
    return trainDate > now;
  };

  const isPastBooking = () => {
    if (isEvent && booking.time) {
      return new Date(booking.time) < new Date();
    }
    if (isTrain && booking.train?.departure) {
      return new Date(booking.train.departure) < new Date();
    }
    return false;
  };

  const handleDownloadTicket = async () => {
    if (!isEvent || !booking.event) return;

    setIsDownloadingPDF(true);
    try {
      const userResponse = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!userResponse.ok) {
        throw new Error("Failed to get user details");
      }

      const user = await userResponse.json();

      const bookingResponse = await fetch(`/api/bookings?id=${booking.id}`, {
        credentials: "include",
      });

      if (!bookingResponse.ok) {
        throw new Error("Failed to get booking details");
      }

      const fullBooking = await bookingResponse.json();

      if (!fullBooking.event) {
        throw new Error("Event details not found in booking");
      }

      const seatsResponse = await fetch(
        `/api/bookings/seats?bookingId=${booking.id}`,
      );
      const seats = await seatsResponse.json();

      const result = await previewTicket({
        event: fullBooking.event,
        user,
        booking: fullBooking,
        seats: seats.seats,
      });

      if (!result.success) {
        console.error("Failed to preview PDF:", result.error);
      }
    } catch (error) {
      console.error("Error previewing ticket:", error);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadTrainTicket = async () => {
    if (!isTrain || !booking.train) return;

    setIsDownloadingPDF(true);
    try {
      const userResponse = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!userResponse.ok) {
        throw new Error("Failed to get user details");
      }

      const user = await userResponse.json();

      const bookingResponse = await fetch(`/api/bookings?id=${booking.id}`, {
        credentials: "include",
      });

      if (!bookingResponse.ok) {
        throw new Error("Failed to get booking details");
      }

      const fullBooking = await bookingResponse.json();

      if (!fullBooking.train) {
        throw new Error("Train details not found in booking");
      }

      const result = await previewTicket({
        train: fullBooking.train,
        user,
        booking: fullBooking,
      });

      if (!result.success) {
        console.error("Failed to preview PDF:", result.error);
      }
    } catch (error) {
      console.error("Error previewing ticket:", error);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  return (
    <div className="font-anek group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-300 hover:scale-105 hover:border-gray-600 hover:shadow-2xl hover:shadow-blue-500/20">
      <div className="relative overflow-hidden">
        <Image
          src={
            isEvent
              ? booking.event?.imageUrl ||
                (isMovie ? "/movie.jpg" : "/concert.jpg")
              : booking.train?.imageUrl || "/train.jpg"
          }
          alt={isEvent ? booking.event!.title : booking.train!.name}
          width={400}
          height={200}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

        <div className="absolute top-3 right-3">
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${getStatusColor(booking.status)}`}
          >
            {booking.status}
          </span>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className="inline-block rounded-full bg-emerald-600/90 px-3 py-1 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
            ₹{booking.totalPrice}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex-1">
          <h3 className="mb-2 text-lg font-bold text-white transition-colors duration-200 group-hover:text-blue-300">
            {isEvent ? booking.event!.title : booking.train!.name}
            {isTrain && (
              <p className="text-sm font-medium text-gray-400">
                {booking.train!.number}
              </p>
            )}
          </h3>

          {isEvent && (
            <>
              <div className="mb-3 flex items-center gap-2">
                <svg
                  className="h-4 w-4 flex-shrink-0 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="truncate text-sm font-medium text-gray-400">
                  {isMovie
                    ? booking.location || "-"
                    : booking.event?.location || "-"}
                </p>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-300">
                  {booking.time ? formatDate(booking.time) : "-"}
                </p>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-orange-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-300">
                  {booking.time ? formatTime(booking.time) : "-"}
                </p>
              </div>
            </>
          )}

          {isTrain && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="text-left">
                  <div className="mb-1 flex items-center gap-1">
                    <svg
                      className="h-3 w-3 text-emerald-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="text-sm font-bold text-white">
                      {booking.train!.from.split("-")[0]}
                    </div>
                  </div>
                  <div className="text-xs font-medium text-emerald-400">
                    {formatTime(booking.train!.departure)}
                  </div>
                </div>

                <div className="mx-3 flex flex-1 items-center">
                  <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-emerald-500 to-red-500"></div>
                </div>

                <div className="text-right">
                  <div className="mb-1 flex items-center justify-end gap-1">
                    <div className="text-sm font-bold text-white">
                      {booking.train!.to.split("-")[0]}
                    </div>
                    <svg
                      className="h-3 w-3 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                        transform="rotate(180 10 10)"
                      />
                    </svg>
                  </div>
                  <div className="text-xs font-medium text-red-400">
                    {formatTime(booking.train!.arrival)}
                  </div>
                </div>
              </div>
              <div className="mb-3 flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-300">
                  {formatDate(booking.train!.departure)}
                </p>
              </div>
            </>
          )}

          <div className="mb-6 rounded-lg bg-gray-800/30 p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <span className="text-gray-300">
                  Quantity: {booking.quantity}
                </span>
              </div>
              <div className="font-bold text-emerald-400">
                Total: ₹{booking.totalPrice}
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Booked on {formatDate(booking.createdAt)}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {booking.status === "CONFIRMED" && isEvent && isUpcomingEvent() && (
            <button
              onClick={handleDownloadTicket}
              disabled={isDownloadingPDF}
              className="font-anek w-full transform cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloadingPDF ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
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
                  Generating...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4"
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
                  View Ticket
                </div>
              )}
            </button>
          )}

          {booking.status === "CONFIRMED" && isTrain && isUpcomingTrain() && (
            <button
              onClick={handleDownloadTrainTicket}
              disabled={isDownloadingPDF}
              className="font-anek w-full transform cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloadingPDF ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
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
                  Generating...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4"
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
                  View Ticket
                </div>
              )}
            </button>
          )}

          {booking.status === "CONFIRMED" && onCancel && !isPastBooking() ? (
            <button
              onClick={() => {
                onCancel(booking.id);
              }}
              disabled={isCancelling}
              className="font-anek w-full transform cursor-pointer rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-none disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCancelling ? (
                <div className="flex items-center justify-center gap-2">
                  Cancelling...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  Cancel Booking
                </div>
              )}
            </button>
          ) : booking.status === "CANCELLED" ? (
            <div className="w-full rounded-lg border-2 border-red-600/50 bg-red-600/10 px-6 py-3 text-center">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <span className="font-semibold">Booking Cancelled</span>
              </div>
            </div>
          ) : (
            !isPastBooking() && (
              <div className="w-full rounded-lg border-2 border-yellow-600/50 bg-yellow-600/10 px-6 py-3 text-center">
                <div className="flex items-center justify-center gap-2 text-yellow-400">
                  <span className="font-semibold">Pending Confirmation</span>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
