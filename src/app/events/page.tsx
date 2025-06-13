"use client";

import EventCard from "@/components/ui/EventCard";
import { Event } from "@prisma/client";
import { useEffect, useRef, useState } from "react";

export default function Events() {
  const [selectedCategory, setSelectedCategory] = useState<string>("BOTH");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(12);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const events: Event[] = [
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

  const filteredEvents =
    selectedCategory === "BOTH"
      ? events
      : events.filter((event) => event.category === selectedCategory);

  const displayedEvents = filteredEvents.slice(0, displayedCount);
  const hasMoreEvents = displayedCount < filteredEvents.length;

  useEffect(() => {
    setDisplayedCount(12);
  }, [selectedCategory]);

  const handleShowMore = () => {
    setDisplayedCount((prev) => prev + 12);
  };

  const categories = [
    { id: "BOTH", label: "All Categories" },
    { id: "MOVIE", label: "Movies" },
    { id: "CONCERT", label: "Concerts" },
  ];

  const selectedOption = categories.find(
    (category) => category.id === selectedCategory,
  );

  const handleFilterChange = (value: string) => {
    setSelectedCategory(value);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] justify-center px-4 sm:px-6">
      <div className="flex w-full flex-col gap-8 p-12">
        <div className="font-anek flex flex-col items-center gap-4 text-white">
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
        </div>

        <div className="font-anek flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="hidden md:block md:flex-1"></div>
          <div className="relative mx-auto w-full max-w-md md:mx-0">
            <input
              type="text"
              placeholder="Search events"
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
          <div className="w-full md:flex md:flex-1 md:justify-end">
            <div className="relative w-full md:w-auto" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="hover:border-ui-blue focus:border-ui-blue focus:ring-ui-blue focus:ring-opacity-50 flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-gray-600 bg-gray-800 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-gray-700 focus:ring-2 focus:outline-none md:w-auto"
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
                <div className="absolute top-12 left-0 z-10 w-full min-w-[160px] rounded-lg border border-gray-600 bg-gray-800 font-medium shadow-lg sm:w-max">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleFilterChange(category.id)}
                      className={`flex w-full cursor-pointer items-center px-4 py-3 text-left transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg hover:bg-gray-700 ${
                        selectedCategory === category.id
                          ? "bg-gray-700 text-white"
                          : "text-white"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="font-anek flex flex-col gap-6">
          {displayedEvents && displayedEvents.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {displayedEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-xl font-semibold text-white">
              No events found for this category
            </div>
          )}
        </section>

        {hasMoreEvents && (
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
