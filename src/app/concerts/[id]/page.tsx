"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { useConcertById } from "@/lib/hooks/useData";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";

export default function ConcertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: concert, isLoading, error } = useConcertById(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] justify-center px-4 sm:px-6">
        <div className="flex w-full flex-col gap-8 p-12">
          <LoadingIndicator text="Loading concert..." />
        </div>
      </div>
    );
  }

  if (error || !concert) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] justify-center px-4 sm:px-6">
        <div className="flex w-full flex-col gap-8 p-12">
          <ErrorMessage message="Concert not found" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <div className="relative h-[70vh] overflow-hidden">
        <Image
          src={concert.imageUrl || "/concert.jpg"}
          alt={concert.title}
          fill
          className="object-cover select-none"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />

        <div className="absolute right-0 bottom-0 left-0 p-8 sm:p-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1">
                <h1 className="font-anek mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                  {concert.title}
                </h1>

                <p className="font-anek mb-6 max-w-3xl text-lg leading-relaxed text-gray-200 sm:text-xl">
                  {concert.description}
                </p>

                <div className="font-anek flex flex-wrap items-center gap-6 text-white">
                  <div className="flex items-center gap-2">
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
                    <span className="text-lg font-medium">
                      {concert.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
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
                    <span className="text-lg font-medium">
                      {new Date(concert.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
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
                    <span className="text-lg font-medium">
                      {new Date(concert.date).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-700 bg-gray-900/80 p-6 backdrop-blur-sm lg:min-w-[280px]">
                <div className="text-center">
                  <p className="font-anek mb-1 text-sm font-medium text-gray-400">
                    Starting from
                  </p>
                  <p className="font-anek mb-4 text-4xl font-bold text-emerald-400">
                    ₹{concert.price.toFixed(2)}
                  </p>
                  <Link
                    href={`/concerts/${concert.id}/book`}
                    className="font-anek inline-block w-full transform rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-lg font-bold text-white transition-all hover:scale-105 hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    Get Tickets
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900">
        <div className="mx-auto max-w-6xl px-8 py-12 sm:px-12">
          <div className="mb-8 text-center">
            <h2 className="font-anek mb-2 text-3xl font-bold text-white">
              Concert Information
            </h2>
            <p className="font-anek text-gray-400">
              Everything you need to know about this amazing performance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-center">
              <div className="mb-4 flex items-center justify-center">
                <div className="rounded-full border border-orange-500/30 bg-orange-600/20 p-3">
                  <svg
                    className="h-6 w-6 text-orange-400"
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
              <h3 className="font-anek mb-2 text-xl font-bold text-white">
                Performance Time
              </h3>
              <p className="font-anek mb-1 text-2xl font-bold text-orange-400">
                {new Date(concert.date).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
              <p className="font-anek text-gray-400">Show starts</p>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-center">
              <div className="mb-4 flex items-center justify-center">
                <div className="rounded-full border border-emerald-500/30 bg-emerald-600/20 p-3">
                  <svg
                    className="h-6 w-6 text-emerald-400"
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
              <h3 className="font-anek mb-2 text-xl font-bold text-white">
                Venue
              </h3>
              <p className="font-anek mb-1 text-lg font-semibold text-emerald-400">
                {concert.location}
              </p>
              <p className="font-anek text-gray-400">Concert hall</p>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-center md:col-span-2 lg:col-span-1">
              <div className="mb-4 flex items-center justify-center">
                <div className="rounded-full border border-blue-500/30 bg-blue-600/20 p-3">
                  <svg
                    className="h-6 w-6 text-blue-400"
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
              <h3 className="font-anek mb-2 text-xl font-bold text-white">
                Date
              </h3>
              <p className="font-anek mb-1 text-lg font-semibold text-blue-400">
                {new Date(concert.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p className="font-anek text-gray-400">
                {new Date(concert.date).getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="mx-auto max-w-6xl px-8 py-16 sm:px-12">
          <div className="rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 backdrop-blur-sm lg:p-12">
            <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
              <div className="text-center lg:text-left">
                <h3 className="font-anek mb-4 text-3xl font-bold text-white">
                  Experience Live Music Magic!
                </h3>
                <p className="font-anek mt-2 text-sm text-gray-400">
                  Easy cancellation • Secure payment • Instant confirmation
                </p>
              </div>

              <div className="flex flex-col items-center gap-6 lg:flex-row lg:gap-8">
                <div className="text-center lg:text-right">
                  <p className="font-anek mb-1 text-sm font-medium text-gray-400">
                    Tickets starting from
                  </p>
                  <p className="font-anek text-4xl font-bold text-emerald-400">
                    ₹{concert.price.toFixed(2)}
                  </p>
                  <p className="font-anek text-sm text-gray-500">per person</p>
                </div>

                <Link
                  href={`/concerts/${concert.id}/book`}
                  className="font-anek group relative transform overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all hover:scale-105 hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <span className="relative z-10">Get Tickets</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
