"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { useTrainById } from "@/lib/hooks/useData";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";

export default function TrainPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: train, isLoading, error } = useTrainById(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] justify-center px-4 sm:px-6">
        <div className="flex w-full flex-col gap-8 p-12">
          <LoadingIndicator text="Loading train..." />
        </div>
      </div>
    );
  }

  if (error || !train) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] justify-center px-4 sm:px-6">
        <div className="flex w-full flex-col gap-8 p-12">
          <ErrorMessage message="Train not found" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <div className="relative h-[60vh] overflow-hidden">
        <Image
          src={train.imageUrl || "/train.jpg"}
          alt={train.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        <div className="absolute right-0 bottom-0 left-0 p-8 sm:p-12">
          <div className="mx-auto max-w-4xl">
            <h1 className="font-anek mb-4 text-4xl font-bold text-white sm:text-5xl">
              {train.name}
            </h1>

            <p className="font-anek mb-6 max-w-3xl text-lg leading-relaxed text-gray-200">
              Train {train.number} • Journey from {train.from} to {train.to}
            </p>

            <div className="font-anek flex flex-wrap items-center gap-4 text-white">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-lg font-medium">
                  Departure: {train.from.split("-")[0]} at{" "}
                  {new Date(train.departure).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
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
                <span className="text-lg font-medium">
                  Arrival: {train.to.split("-")[0]} at{" "}
                  {new Date(train.arrival).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
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
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-lg font-medium">
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
                  {new Date(train.departure).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-8 py-12 sm:px-12">
        <div className="w-full rounded-lg border border-gray-700 bg-gray-800 p-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="text-center lg:text-left">
              <h3 className="font-anek mb-2 text-2xl font-bold text-white">
                Ready to Book?
              </h3>
              <p className="font-anek text-gray-300">
                Don't worry, you can always cancel
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-6">
              <div className="text-center lg:text-left">
                <p className="font-anek text-sm font-medium text-gray-400">
                  Price from:
                </p>
                <p className="font-anek text-3xl font-bold text-green-400">
                  ₹{train.price.toFixed(2)}
                </p>
              </div>
              <Link
                href={`/trains/${train.id}/book`}
                className="font-anek rounded-lg bg-blue-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
