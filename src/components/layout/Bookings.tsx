"use client";

import BookingCard from "@/components/ui/BookingCard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import TransactionCard from "@/components/ui/TransactionCard";
import useBookings from "@/lib/hooks/useBookings";
import { Booking, Event, PaymentMethod, Train } from "@prisma/client";
import { useState } from "react";

type BookingWithIncludes = Booking & {
  event?: Event | null;
  train?: Train | null;
  paymentMethod?: PaymentMethod;
  paymentIntentId?: string | null;
};

export default function Bookings() {
  const {
    upcomingBookings,
    pastBookings,
    bookings: allBookings,
    isLoading: bookingsLoading,
    cancelBooking,
  } = useBookings();

  const [cancellingBookings, setCancellingBookings] = useState<Set<string>>(
    new Set(),
  );
  const [activeBookingTab, setActiveBookingTab] = useState<
    "upcoming" | "past" | "transactions"
  >("upcoming");
  const [upcomingDisplayedCount, setUpcomingDisplayedCount] = useState(6);
  const [pastDisplayedCount, setPastDisplayedCount] = useState(6);

  const transactionHistory = allBookings.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingBookings((prev) => new Set(prev).add(bookingId));
      await cancelBooking(bookingId);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    } finally {
      setCancellingBookings((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const formatBookingForCard = (booking: BookingWithIncludes) => {
    return {
      id: booking.id,
      quantity: booking.quantity,
      totalPrice: booking.totalPrice,
      time:
        booking.time instanceof Date
          ? booking.time.toISOString()
          : new Date(booking.time).toISOString(),
      status: booking.status as "PENDING" | "CONFIRMED" | "CANCELLED",
      createdAt:
        booking.createdAt instanceof Date
          ? booking.createdAt.toISOString()
          : new Date(booking.createdAt).toISOString(),
      event: booking.event
        ? {
            title: booking.event.title,
            date:
              booking.event.date instanceof Date
                ? booking.event.date.toISOString()
                : new Date(booking.event.date).toISOString(),
            location: booking.event.location,
            imageUrl: booking.event.imageUrl || undefined,
            category: booking.event.category as "MOVIE" | "CONCERT",
          }
        : undefined,
      train: booking.train
        ? {
            name: booking.train.name,
            number: booking.train.number,
            departure:
              booking.train.departure instanceof Date
                ? booking.train.departure.toISOString()
                : new Date(booking.train.departure).toISOString(),
            arrival:
              booking.train.arrival instanceof Date
                ? booking.train.arrival.toISOString()
                : new Date(booking.train.arrival).toISOString(),
            from: booking.train.from,
            to: booking.train.to,
            imageUrl: booking.train.imageUrl || undefined,
          }
        : undefined,
    };
  };

  const displayedUpcomingBookings = upcomingBookings.slice(
    0,
    upcomingDisplayedCount,
  );
  const displayedPastBookings = pastBookings.slice(0, pastDisplayedCount);
  const hasMoreUpcomingBookings =
    upcomingDisplayedCount < upcomingBookings.length;
  const hasMorePastBookings = pastDisplayedCount < pastBookings.length;

  const handleShowMoreUpcoming = () => {
    setUpcomingDisplayedCount((prev) => prev + 6);
  };

  const handleShowMorePast = () => {
    setPastDisplayedCount((prev) => prev + 6);
  };

  return (
    <div className="mb-12">
      <div className="mb-8">
        <h2 className="font-anek mb-8 text-center text-3xl font-bold text-white">
          My Bookings
        </h2>

        <div className="relative flex justify-center">
          <div className="flex gap-2 rounded-lg border border-gray-600/50 bg-gray-800/50 p-1 backdrop-blur-sm">
            <button
              onClick={() => setActiveBookingTab("upcoming")}
              className={`font-anek cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeBookingTab === "upcoming"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-anek">Upcoming</span>
                <span
                  className={`font-anek rounded-full px-1.5 py-0.5 text-xs font-medium ${
                    activeBookingTab === "upcoming"
                      ? "bg-white/20 text-white"
                      : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {upcomingBookings.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveBookingTab("past")}
              className={`font-anek cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeBookingTab === "past"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-anek">Past</span>
                <span
                  className={`font-anek rounded-full px-1.5 py-0.5 text-xs font-medium ${
                    activeBookingTab === "past"
                      ? "bg-white/20 text-white"
                      : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {pastBookings.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => {
                setActiveBookingTab("transactions");
              }}
              className={`font-anek cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeBookingTab === "transactions"
                  ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-anek">Transactions</span>
                <span
                  className={`font-anek rounded-full px-1.5 py-0.5 text-xs font-medium ${
                    activeBookingTab === "transactions"
                      ? "bg-white/20 text-white"
                      : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {transactionHistory.length}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="relative min-h-[400px]">
        {bookingsLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingIndicator />
          </div>
        ) : (
          <>
            <div
              className={`transition-all duration-500 ${activeBookingTab === "upcoming" ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}
            >
              {activeBookingTab === "upcoming" && (
                <>
                  {upcomingBookings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {displayedUpcomingBookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={formatBookingForCard(booking)}
                          onCancel={() => handleCancelBooking(booking.id)}
                          isCancelling={cancellingBookings.has(booking.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-20">
                      <p className="font-anek text-gray-400">
                        No upcoming bookings
                      </p>
                    </div>
                  )}

                  {hasMoreUpcomingBookings && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleShowMoreUpcoming}
                        className="font-anek cursor-pointer rounded-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-blue-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                      >
                        Show More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div
              className={`transition-all duration-500 ${activeBookingTab === "past" ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}
            >
              {activeBookingTab === "past" && (
                <>
                  {pastBookings.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                      {displayedPastBookings.map((booking) => (
                        <BookingCard
                          key={booking.id}
                          booking={formatBookingForCard(booking)}
                          onCancel={() => handleCancelBooking(booking.id)}
                          isCancelling={cancellingBookings.has(booking.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-20">
                      <p className="font-anek text-gray-400">
                        No past bookings
                      </p>
                    </div>
                  )}

                  {hasMorePastBookings && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={handleShowMorePast}
                        className="font-anek cursor-pointer rounded-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-blue-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                      >
                        Show More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div
              className={`transition-all duration-500 ${activeBookingTab === "transactions" ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}
            >
              {activeBookingTab === "transactions" && (
                <>
                  {bookingsLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <LoadingIndicator text="Loading transactions..." />
                    </div>
                  ) : transactionHistory.length > 0 ? (
                    <div className="space-y-4">
                      {transactionHistory.map((transaction) => (
                        <TransactionCard
                          key={transaction.id}
                          transaction={transaction}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-20">
                      <p className="font-anek text-gray-400">
                        No transaction history
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
