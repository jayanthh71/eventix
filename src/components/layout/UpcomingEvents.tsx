"use client";

import EventCard from "@/components/ui/EventCard";
import { Event, EventCategory } from "@prisma/client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function UpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filterBy, setFilterBy] = useState<EventCategory | "BOTH">("BOTH");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchEvents() {
      const fetchedEvents: Event[] = [
        {
          id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb284",
          title: "The First Movie",
          description: "This is an amazing movie, pretty cool and long",
          imageUrl: null,
          date: new Date("2025-06-10T18:29:12.119Z"),
          location: "City Center Deira",
          price: 120,
          category: "MOVIE",
          createdAt: new Date("2025-06-11T21:29:47.060Z"),
          updatedAt: new Date("2025-06-11T21:29:47.060Z"),
        },
        {
          id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb288",
          title: "The First Concert",
          description: "This is an amazing concert, pretty cool and loud",
          imageUrl: null,
          date: new Date("2025-06-10T18:29:12.119Z"),
          location: "Coca Cola Arena",
          price: 120,
          category: "CONCERT",
          createdAt: new Date("2025-06-11T21:29:47.060Z"),
          updatedAt: new Date("2025-06-11T21:29:47.060Z"),
        },
        {
          id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb285",
          title: "The Second Movie",
          description: "This is an amazing movie, pretty cool and long",
          imageUrl: null,
          date: new Date("2025-06-10T18:29:12.119Z"),
          location: "LA Maris",
          price: 120,
          category: "MOVIE",
          createdAt: new Date("2025-06-11T21:29:47.060Z"),
          updatedAt: new Date("2025-06-11T21:29:47.060Z"),
        },
        {
          id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb289",
          title: "The Second Concert",
          description: "This is an amazing concert, pretty cool and loud",
          imageUrl: null,
          date: new Date("2025-06-10T18:29:12.119Z"),
          location: "Expo City",
          price: 120,
          category: "CONCERT",
          createdAt: new Date("2025-06-11T21:29:47.060Z"),
          updatedAt: new Date("2025-06-11T21:29:47.060Z"),
        },
        {
          id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb290",
          title: "The Third Concert",
          description: "This is an amazing concert, pretty cool and loud",
          imageUrl: null,
          date: new Date("2025-06-10T18:29:12.119Z"),
          location: "Coca Cola Arena",
          price: 120,
          category: "CONCERT",
          createdAt: new Date("2025-06-11T21:29:47.060Z"),
          updatedAt: new Date("2025-06-11T21:29:47.060Z"),
        },
        {
          id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb286",
          title: "The Third Movie",
          description: "This is an amazing movie, pretty cool and long",
          imageUrl: null,
          date: new Date("2025-06-10T18:29:12.119Z"),
          location: "BHELEC Cinema",
          price: 120,
          category: "MOVIE",
          createdAt: new Date("2025-06-11T21:29:47.060Z"),
          updatedAt: new Date("2025-06-11T21:29:47.060Z"),
        },
        {
          id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb291",
          title: "The Fourth Concert",
          description: "This is an amazing concert, pretty cool and loud",
          imageUrl: null,
          date: new Date("2025-06-10T18:29:12.119Z"),
          location: "Expo City",
          price: 120,
          category: "CONCERT",
          createdAt: new Date("2025-06-11T21:29:47.060Z"),
          updatedAt: new Date("2025-06-11T21:29:47.060Z"),
        },
        {
          id: "92c82ccf-c602-4b5b-b0dd-d7cb59ccb287",
          title: "The Fourth Movie",
          description: "This is an amazing movie, pretty cool and long",
          imageUrl: null,
          date: new Date("2025-06-10T18:29:12.119Z"),
          location: "Dubai Mall",
          price: 120,
          category: "MOVIE",
          createdAt: new Date("2025-06-11T21:29:47.060Z"),
          updatedAt: new Date("2025-06-11T21:29:47.060Z"),
        },
      ];
      // const fetchedEvents = await getEvents(filterBy, "date", 8);
      setEvents(fetchedEvents);
    }
    fetchEvents();
  }, [filterBy]);

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
  ];

  const selectedOption = filterOptions.find(
    (option) => option.value === filterBy,
  );

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
            className="hover:border-ui-blue focus:border-ui-blue focus:ring-ui-blue focus:ring-opacity-50 flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-gray-700 focus:ring-2 focus:outline-none sm:w-auto"
          >
            <span>{selectedOption?.label}</span>
            <svg
              className={`h-4 w-4 transition-transform duration-200 ${
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
            <div className="absolute top-12 right-0 z-10 w-full min-w-[160px] rounded-lg border border-gray-600 bg-gray-800 font-medium shadow-lg sm:w-max">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilterBy(option.value);
                    setIsDropdownOpen(false);
                  }}
                  className={`flex w-full cursor-pointer items-center px-4 py-3 text-left transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg hover:bg-gray-700 ${
                    filterBy === option.value
                      ? "bg-gray-700 text-white"
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

      {events && events.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center text-xl font-semibold">
          No events found
        </div>
      )}
    </section>
  );
}
