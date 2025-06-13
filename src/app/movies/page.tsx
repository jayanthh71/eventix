"use client";

import EventCard from "@/components/ui/EventCard";
import { Event } from "@prisma/client";
import { useState } from "react";

export default function Movies() {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(12);

  const movies: Event[] = [
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

  const hasMoreMovies = displayedCount < movies.length;

  const handleShowMore = () => {
    setDisplayedCount((prev) => prev + 12);
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] justify-center px-4 sm:px-6">
      <div className="flex w-full flex-col gap-8 p-12">
        <div className="font-anek flex flex-col items-center gap-4 text-white">
          <h1 className="text-3xl font-bold">New Movies</h1>
        </div>

        <div className="font-anek flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              placeholder="Search movies"
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

        <section className="font-anek flex flex-col gap-6">
          {movies && movies.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {movies.map((movie) => (
                <EventCard key={movie.id} {...movie} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-xl font-semibold text-white">
              No movies found
            </div>
          )}
        </section>

        {hasMoreMovies && (
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
