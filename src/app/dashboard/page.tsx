"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import VendorEventCard from "@/components/ui/VendorEventCard";
import useAuth from "@/lib/hooks/useAuth";
import { useVendorEvents, useVendorStats } from "@/lib/hooks/useData";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function Dashboard() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedCount, setDisplayedCount] = useState(8);

  const isAuthorized =
    isLoggedIn && (user?.role === "VENDOR" || user?.role === "ADMIN");

  const {
    data: allEvents = [],
    isLoading: eventsLoading,
    error: eventsError,
  } = useVendorEvents(isAuthorized);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useVendorStats(isAuthorized);

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

  useEffect(() => {
    if (searchQuery) {
      setDisplayedCount(8);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (
      !authLoading &&
      (!isLoggedIn || (user?.role !== "VENDOR" && user?.role !== "ADMIN"))
    ) {
      router.push("/");
    }
  }, [authLoading, isLoggedIn, user?.role, router]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["vendor-events"] });
    queryClient.invalidateQueries({ queryKey: ["vendor-stats"] });
  }, [queryClient]);

  const handleShowMore = () => {
    setSearchQuery("");
    setDisplayedCount((prev) => prev + 8);
  };

  if (authLoading || (isAuthorized && (eventsLoading || statsLoading))) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (!isLoggedIn || (user?.role !== "VENDOR" && user?.role !== "ADMIN")) {
    return null;
  }

  if (eventsError || statsError) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
        <div className="flex w-full flex-col gap-8 p-12">
          <ErrorMessage message="Failed to load dashboard data" />
        </div>
      </div>
    );
  }

  const displayedEvents = filteredEvents.slice(0, displayedCount);
  const hasMoreEvents = displayedCount < filteredEvents.length;

  return (
    <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
      <div className="flex w-full flex-col gap-8 p-12">
        <div className="font-anek flex flex-col items-center gap-4 text-white">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-center text-lg text-gray-300">
            Manage your events and track their performance
          </p>
        </div>

        <section className="font-anek flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4 text-white">
            <h2 className="text-2xl font-bold">Event Statistics</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-indigo-600/20 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6 text-indigo-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalEvents || 0}
                  </p>
                  <p className="text-sm text-gray-400">Total Events</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-600/20 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6 text-emerald-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalAttendees || 0}
                  </p>
                  <p className="text-sm text-gray-400">Total Attendees</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-600/20 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-6 w-6 text-purple-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    ₹
                    {stats?.totalRevenue
                      ? stats.totalRevenue.toFixed(2)
                      : "0.00"}
                  </p>
                  <p className="text-sm text-gray-400">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-center">
          <Link
            href="/dashboard/new"
            className="font-anek cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600/80 to-purple-600/80 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-indigo-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add New Event
            </div>
          </Link>
        </div>

        <section className="font-anek flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4 text-white">
            <h2 className="text-2xl font-bold">My Events</h2>
          </div>

          {!eventsLoading && !eventsError && allEvents.length > 0 && (
            <div className="font-anek flex justify-center">
              <div className="relative w-full max-w-md">
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
            </div>
          )}

          {allEvents.length === 0 ? (
            <p className="font-anek text-center text-lg text-gray-400">
              You haven&apos;t organized any events yet.
            </p>
          ) : displayedEvents.length === 0 ? (
            <p className="font-anek text-center text-lg text-gray-400">
              {searchQuery ? "No events match your search" : "No events found"}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {displayedEvents.map((event) => (
                  <VendorEventCard key={event.id} {...event} />
                ))}
              </div>

              {hasMoreEvents &&
                !searchQuery &&
                !eventsLoading &&
                !eventsError && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleShowMore}
                      className="font-anek cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600/80 to-purple-600/80 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-indigo-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                    >
                      Show More
                    </button>
                  </div>
                )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
