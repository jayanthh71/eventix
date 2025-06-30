"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { Event } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface EventWithCount extends Event {
  vendor?: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count?: {
    bookings: number;
  };
}

export default function EventManagement() {
  const [displayedCount, setDisplayedCount] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const response = await fetch("/api/admin/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      return response.json();
    },
  });

  const displayedEvents = events
    .filter(
      (event: EventWithCount) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .slice(0, displayedCount);
  const hasMoreEvents =
    displayedCount <
    events.filter(
      (event: EventWithCount) =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()),
    ).length;

  const handleShowMore = () => {
    setDisplayedCount((prev) => prev + 10);
  };

  const router = useRouter();

  const handleEditEvent = (event: EventWithCount) => {
    router.push(`/admin/edit?event=${event.id}`);
  };

  const handleAddEvent = () => {
    router.push("/admin/new");
  };

  if (isLoading) {
    return (
      <LoadingIndicator text="Loading events..." size="lg" className="h-64" />
    );
  }

  if (error) {
    return <ErrorMessage message={error.message} className="h-64" />;
  }

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
      <div className="font-anek space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-white">Event Management</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 px-4 py-3 pl-12 font-medium text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 hover:from-gray-700/80 hover:to-gray-600/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none sm:w-64"
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
            <button
              onClick={handleAddEvent}
              className="font-anek flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600/80 to-purple-600/80 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-indigo-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
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
              Add New Event
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-600/50 bg-gray-800/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-700/50">
                <tr className="divide-x divide-gray-600/50">
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Event
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Bookings
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30 bg-gray-800/30">
                {displayedEvents.map((event: EventWithCount) => (
                  <tr
                    key={event.id}
                    className="divide-x divide-gray-600/50 transition-colors hover:bg-gray-700/30"
                  >
                    <td className="px-6 py-4 text-center text-base text-white">
                      <div>
                        <div className="font-semibold">{event.title}</div>
                        <div className="text-sm text-gray-400">
                          {event.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-base text-gray-300">
                      {event.category === "MOVIE" ? (
                        "-"
                      ) : event.vendor ? (
                        <div className="font-semibold">{event.vendor.name}</div>
                      ) : (
                        <span className="text-gray-500">No vendor</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-base text-gray-300">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm leading-5 font-semibold ${
                          event.category === "MOVIE"
                            ? "bg-red-600/20 text-red-400"
                            : event.category === "CONCERT"
                              ? "bg-blue-600/20 text-blue-400"
                              : "bg-gray-600/20 text-gray-400"
                        }`}
                      >
                        {event.category === "MOVIE"
                          ? "MOVIE"
                          : event.category === "CONCERT"
                            ? "CONCERT"
                            : event.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-base text-gray-300">
                      {new Date(event.date).toLocaleDateString()}
                      {event.category === "MOVIE" &&
                        ` + ${event.dateArr.length}`}
                    </td>
                    <td className="px-6 py-4 text-center text-base font-bold text-emerald-400">
                      ₹{event.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center text-base font-medium text-gray-300">
                      {event._count?.bookings || 0}
                    </td>
                    <td className="px-6 py-4 text-center text-base font-medium">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="font-anek flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600/80 to-indigo-600/80 px-4 py-2 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-blue-500/80 hover:to-indigo-500/80 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {hasMoreEvents && (
          <div className="flex justify-center">
            <button
              onClick={handleShowMore}
              className="font-anek cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600/80 to-purple-600/80 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-indigo-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
            >
              Show More
            </button>
          </div>
        )}

        {events.length === 0 && !isLoading && (
          <div className="py-8 text-center">
            <p className="text-lg text-gray-400">No events found</p>
          </div>
        )}
      </div>
    </div>
  );
}
