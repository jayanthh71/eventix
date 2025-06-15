"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import EventCard from "@/components/ui/EventCard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { useEvents } from "@/lib/hooks/useData";
import { EventCategory } from "@prisma/client";
import { useEffect, useMemo, useRef, useState } from "react";

export default function Events() {
  const [selectedCategory, setSelectedCategory] = useState<
    EventCategory | "BOTH"
  >("BOTH");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(12);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    data: allEvents = [],
    isLoading,
    error,
  } = useEvents(selectedCategory, "date", 50);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return allEvents;

    const query = searchQuery.toLowerCase();
    return allEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query),
    );
  }, [allEvents, searchQuery]);

  const displayedEvents = filteredEvents.slice(0, displayedCount);
  const hasMoreEvents = displayedCount < filteredEvents.length;

  const handleShowMore = () => {
    setSearchQuery("");
    setDisplayedCount((prev) => prev + 12);
  };

  const filterOptions = [
    { value: "BOTH" as const, label: "All Categories" },
    { value: "MOVIE" as const, label: "Movies" },
    { value: "CONCERT" as const, label: "Concerts" },
  ];

  const selectedOption = filterOptions.find(
    (option) => option.value === selectedCategory,
  );

  const handleFilterChange = (value: EventCategory | "BOTH") => {
    setSelectedCategory(value);
    setSearchQuery("");
    setDisplayedCount(12);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
      <div className="flex w-full flex-col gap-8 p-12">
        <div className="font-anek flex flex-col items-center gap-4 text-white">
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
        </div>

        {!isLoading && !error && (
          <div className="font-anek flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="hidden md:block md:flex-1"></div>
            <div className="relative mx-auto w-full max-w-md md:mx-0">
              <input
                type="text"
                placeholder="Search events"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 px-4 py-3 pl-12 font-medium text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:from-gray-700/80 hover:to-gray-600/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
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
            <div className="w-full md:flex md:flex-1 md:justify-end">
              <div className="relative w-full md:w-auto" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:from-gray-700/80 hover:to-gray-600/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none md:w-auto"
                >
                  <span>{selectedOption?.label}</span>
                  <svg
                    className={`h-5 w-5 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-14 left-0 z-10 w-full min-w-[160px] rounded-xl border border-gray-600/50 bg-gray-800/90 font-medium shadow-2xl backdrop-blur-sm sm:w-max">
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange(option.value)}
                        className={`flex w-full cursor-pointer items-center px-4 py-3 text-left transition-all duration-200 first:rounded-t-xl last:rounded-b-xl hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-purple-600/20 ${
                          selectedCategory === option.value
                            ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-white"
                            : "text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <section className="font-anek flex flex-col gap-6">
          {isLoading ? (
            <LoadingIndicator text="Loading events..." />
          ) : error ? (
            <ErrorMessage message="Failed to load events" />
          ) : displayedEvents && displayedEvents.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {displayedEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <div className="font-anek flex items-center justify-center py-12 text-xl font-semibold text-white">
              {searchQuery ? "No events match your search" : "No events found"}
            </div>
          )}
        </section>

        {hasMoreEvents && !searchQuery && !isLoading && !error && (
          <div className="flex justify-center">
            <button
              onClick={handleShowMore}
              className="font-anek cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600/80 to-purple-600/80 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-indigo-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
