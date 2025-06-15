"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import EventCard from "@/components/ui/EventCard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { useConcerts } from "@/lib/hooks/useData";
import { useMemo, useState } from "react";

export default function Concerts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(12);

  const { data: allConcerts = [], isLoading, error } = useConcerts(25);

  const filteredConcerts = useMemo(() => {
    if (!searchQuery.trim()) return allConcerts;

    const query = searchQuery.toLowerCase();
    return allConcerts.filter(
      (concert) =>
        concert.title.toLowerCase().includes(query) ||
        concert.description.toLowerCase().includes(query) ||
        concert.location.toLowerCase().includes(query),
    );
  }, [allConcerts, searchQuery]);

  const displayedConcerts = filteredConcerts.slice(0, displayedCount);
  const hasMoreConcerts = displayedCount < filteredConcerts.length;

  const handleShowMore = () => {
    setSearchQuery("");
    setDisplayedCount((prev) => prev + 12);
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
      <div className="flex w-full flex-col gap-8 p-12">
        <div className="font-anek flex flex-col items-center gap-4 text-white">
          <h1 className="text-3xl font-bold">New Concerts</h1>
        </div>

        {!isLoading && !error && (
          <div className="font-anek flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search concerts"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 px-4 py-3 pl-12 font-medium text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-purple-500/50 hover:from-gray-700/80 hover:to-gray-600/80 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
              />
              <svg
                className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400 transition-colors duration-200"
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
            <LoadingIndicator text="Loading concerts..." />
          ) : error ? (
            <ErrorMessage message="Failed to load concerts" />
          ) : displayedConcerts && displayedConcerts.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {displayedConcerts.map((concert) => (
                <EventCard key={concert.id} {...concert} />
              ))}
            </div>
          ) : (
            <div className="font-anek flex items-center justify-center py-12 text-xl font-semibold text-white">
              {searchQuery
                ? "No concerts match your search"
                : "No concerts found"}
            </div>
          )}
        </section>

        {hasMoreConcerts && !searchQuery && !isLoading && !error && (
          <div className="flex justify-center">
            <button
              onClick={handleShowMore}
              className="font-anek cursor-pointer rounded-xl bg-gradient-to-r from-purple-600/80 to-pink-600/80 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-purple-500/80 hover:to-pink-500/80 focus:ring-2 focus:ring-purple-500/30 focus:outline-none"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
