"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import useAuth from "@/lib/hooks/useAuth";
import { useTrainById } from "@/lib/hooks/useData";
import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";

export default function TrainBooking({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { data: train, isLoading: trainLoading, error } = useTrainById(id);

  const [seats, setSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const totalPrice = train ? seats * train.price : 0;

  const incrementSeats = () => {
    if (seats < 10) setSeats(seats + 1);
  };

  const decrementSeats = () => {
    if (seats > 1) setSeats(seats - 1);
  };

  const handleBooking = async () => {
    if (!train || !user) return;

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
          trainId: train.id,
          quantity: seats,
          totalPrice,
          time: new Date(train.departure),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create booking");
      }

      setBookingSuccess(true);
    } catch (error) {
      setBookingError(
        error instanceof Error ? error.message : "Booking failed",
      );
    } finally {
      setIsBooking(false);
    }
  };

  if (authLoading || trainLoading) {
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
                You need to be logged in to book train tickets.
              </p>
              <div className="space-y-3">
                <Link
                  href={`/login?redirect=/trains/${id}/book`}
                  className="block w-full rounded-xl bg-gradient-to-r from-purple-600/80 to-pink-600/80 px-6 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-purple-500/80 hover:to-pink-500/80 focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
                >
                  Login
                </Link>
                <Link
                  href={`/register?redirect=/trains/${id}/book`}
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

  if (error || !train) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
        <div className="flex w-full flex-col gap-8 p-12">
          <ErrorMessage message="Train not found" />
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
                Your tickets for {train.name} from {train.from.split("-")[1]} to{" "}
                {train.to.split("-")[1]} have been booked successfully.
              </p>
              <div className="space-y-3">
                <Link
                  href={`/trains/${train.id}`}
                  className="block w-full cursor-pointer rounded-xl bg-gradient-to-r from-purple-600/80 to-pink-600/80 px-6 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-purple-500/80 hover:to-pink-500/80 focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
                >
                  Back to Train
                </Link>
                <Link
                  href="/trains"
                  className="block w-full cursor-pointer rounded-xl border border-gray-600/50 bg-gray-800/50 px-6 py-3 font-medium text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-500/50 hover:bg-gray-700/50 focus:ring-2 focus:ring-gray-500/30 focus:outline-none"
                >
                  Browse More Trains
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
            Book Your Journey
          </h1>
          <p className="font-anek text-lg text-gray-400">
            Complete your train booking for this journey
          </p>
        </div>

        <div className="mx-auto max-w-6xl">
          <div className="mb-8 rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 backdrop-blur-sm">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={train.imageUrl || "/train.jpg"}
                    alt={train.name}
                    fill
                    className="object-cover select-none"
                  />
                </div>
                <h2 className="font-anek mb-2 text-3xl font-bold text-white lg:text-4xl">
                  {train.name}
                </h2>
                <p className="font-anek mb-4 text-xl font-medium text-gray-400">
                  {train.number}
                </p>
                <p className="font-anek text-lg leading-relaxed text-gray-300">
                  Journey from {train.from} to {train.to}
                  <br />
                  Duration:{" "}
                  {Math.floor(
                    (new Date(train.arrival).getTime() -
                      new Date(train.departure).getTime()) /
                      (1000 * 60 * 60),
                  )}
                  h{" "}
                  {Math.floor(
                    ((new Date(train.arrival).getTime() -
                      new Date(train.departure).getTime()) %
                      (1000 * 60 * 60)) /
                      (1000 * 60),
                  )}
                  m
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-4">
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
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="font-anek mb-1 text-sm font-bold text-white">
                    Departure from {train.from.split("-")[1]}
                  </h3>
                  <p className="font-anek text-lg font-bold text-emerald-400">
                    {new Date(train.departure).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-4 text-center">
                  <div className="mb-3 flex items-center justify-center">
                    <div className="rounded-full border border-red-500/30 bg-red-600/20 p-2">
                      <svg
                        className="h-5 w-5 text-red-400"
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
                  </div>
                  <h3 className="font-anek mb-1 text-sm font-bold text-white">
                    Arrival at {train.to.split("-")[1]}
                  </h3>
                  <p className="font-anek text-lg font-bold text-red-400">
                    {new Date(train.arrival).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
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
                    {new Date(train.departure).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-6 backdrop-blur-sm">
              <h3 className="font-anek mb-4 text-xl font-bold text-white">
                Booking Details
              </h3>

              <div className="flex items-center justify-between">
                <span className="font-anek text-lg font-medium text-white">
                  Number of passengers:
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={decrementSeats}
                    disabled={seats <= 1}
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-700/80 to-gray-800/80 text-white backdrop-blur-sm transition-all duration-300 hover:border-green-500/50 hover:from-gray-600/80 hover:to-gray-700/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-gray-700/80 disabled:hover:to-gray-800/80"
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
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-700/80 to-gray-800/80 text-white backdrop-blur-sm transition-all duration-300 hover:border-green-500/50 hover:from-gray-600/80 hover:to-gray-700/80 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-gray-700/80 disabled:hover:to-gray-800/80"
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
                    ₹{train.price.toFixed(2)}
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

            <button
              onClick={handleBooking}
              disabled={
                isBooking ||
                !!(
                  paymentMethod === "wallet" &&
                  user &&
                  (user.balance ?? 0) < totalPrice
                )
              }
              className="font-anek w-full cursor-pointer rounded-xl bg-gradient-to-r from-green-600/80 to-blue-600/80 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-green-500/80 hover:to-blue-500/80 focus:ring-2 focus:ring-green-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
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
                `Book Journey - ₹${totalPrice.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
