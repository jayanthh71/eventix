"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import EventCard from "@/components/ui/EventCard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { useUpcomingEvents } from "@/lib/hooks/useData";
import { EventCategory } from "@prisma/client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function UpcomingEvents() {
  const [filterBy, setFilterBy] = useState<EventCategory | "BOTH">("BOTH");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    data: events = [],
    isLoading,
    error,
  } = useUpcomingEvents(filterBy, 8);

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

  const filterOptions = [
    { value: "BOTH" as const, label: "All Categories" },
    { value: "MOVIE" as const, label: "Movies" },
    { value: "CONCERT" as const, label: "Concerts" },
    { value: "TRAIN" as const, label: "Trains" },
  ];

  const selectedOption = filterOptions.find(
    (option) => option.value === filterBy,
  );

  const scrollToTrains = () => {
    const trainsSection = document.getElementById("trains");
    if (trainsSection) {
      const headerHeight = 80;
      const elementPosition =
        trainsSection.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - 20;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleFilterChange = (value: EventCategory | "BOTH" | "TRAIN") => {
    if (value === "TRAIN") {
      scrollToTrains();
    } else {
      setFilterBy(value as EventCategory | "BOTH");
    }
    setIsDropdownOpen(false);
  };

  return (
    <section className="font-anek flex flex-col gap-8 fill-white text-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          className="flex w-fit items-center text-2xl font-semibold hover:fill-gray-400 hover:text-gray-400"
          href="/events"
        >
          Upcoming Events
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            height="24px"
            width="24px"
          >
            <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z" />
          </svg>
        </Link>
        <div className="relative w-full sm:w-auto" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 px-4 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:from-gray-700/80 hover:to-gray-600/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none sm:w-auto"
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
            <div className="absolute top-14 right-0 z-10 w-full min-w-[160px] rounded-xl border border-gray-600/50 bg-gray-800/90 font-medium shadow-2xl backdrop-blur-sm sm:w-max">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange(option.value)}
                  className={`flex w-full cursor-pointer items-center px-4 py-3 text-left transition-all duration-200 first:rounded-t-xl last:rounded-b-xl hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-purple-600/20 ${
                    filterBy === option.value
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

      {isLoading ? (
        <LoadingIndicator text="Loading events..." />
      ) : error ? (
        <ErrorMessage message="Failed to load events" />
      ) : events && events.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      ) : (
        <div className="font-anek flex items-center justify-center text-xl font-semibold text-white">
          No events found
        </div>
      )}
    </section>
  );
}
