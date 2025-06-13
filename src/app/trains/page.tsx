"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import TrainCard from "@/components/ui/TrainCard";
import { useTrains } from "@/lib/hooks/useData";
import { useMemo, useState } from "react";

export default function Trains() {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(12);

  const { data: allTrains = [], isLoading, error } = useTrains(25);

  const filteredTrains = useMemo(() => {
    if (!searchQuery.trim()) return allTrains;

    const query = searchQuery.toLowerCase();
    return allTrains.filter(
      (train) =>
        train.name.toLowerCase().includes(query) ||
        train.number.toLowerCase().includes(query) ||
        train.from.toLowerCase().includes(query) ||
        train.to.toLowerCase().includes(query),
    );
  }, [allTrains, searchQuery]);

  const displayedTrains = filteredTrains.slice(0, displayedCount);
  const hasMoreTrains = displayedCount < filteredTrains.length;

  const handleShowMore = () => {
    setSearchQuery("");
    setDisplayedCount((prev) => prev + 12);
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] justify-center px-4 sm:px-6">
      <div className="flex w-full flex-col gap-8 p-12">
        <div className="font-anek flex flex-col items-center gap-4 text-white">
          <h1 className="text-3xl font-bold">Book Trains</h1>
        </div>

        {!isLoading && !error && (
          <div className="font-anek flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search trains"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-opacity-50 w-full rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 pl-10 font-medium text-white placeholder-gray-400 transition-all duration-200 hover:bg-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <svg
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        )}

        <section className="font-anek flex flex-col gap-6">
          {isLoading ? (
            <LoadingIndicator text="Loading trains..." />
          ) : error ? (
            <ErrorMessage message="Failed to load trains" />
          ) : displayedTrains && displayedTrains.length ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {displayedTrains.map((train) => (
                <TrainCard key={train.id} {...train} />
              ))}
            </div>
          ) : (
            <div className="font-anek flex items-center justify-center text-xl font-semibold text-white">
              {searchQuery ? "No trains match your search" : "No trains found"}
            </div>
          )}
        </section>

        {hasMoreTrains && !searchQuery && !isLoading && !error && (
          <div className="flex justify-center">
            <button
              onClick={handleShowMore}
              className="focus:ring-opacity-50 font-anek cursor-pointer rounded-lg bg-gray-800 px-6 py-2 font-medium text-white transition-all duration-200 hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
