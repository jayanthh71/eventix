"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { Booking, BookingStatus } from "@prisma/client";
import { useCallback, useEffect, useState } from "react";

interface ExtendedBooking extends Booking {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  event: {
    id: string;
    title: string;
    category: string;
    vendor: {
      id: string;
      name: string;
      email: string;
    } | null;
  } | null;
  train: {
    id: string;
    name: string;
    number: string;
    from: string;
    to: string;
  } | null;
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<ExtendedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    eventId: "",
    userId: "",
    startDate: "",
    endDate: "",
    status: "",
  });

  const [events, setEvents] = useState<Array<{ id: string; title: string }>>(
    [],
  );
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  const [dateError, setDateError] = useState<string | null>(null);

  const [displayedBookingsCount, setDisplayedBookingsCount] = useState(8);

  const fetchBookings = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(`/api/admin/bookings?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setError("Failed to fetch bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setError("An error occurred while fetching bookings");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchBookings();
    fetchFilterOptions();
  }, [fetchBookings]);

  useEffect(() => {
    fetchBookings();
    setDisplayedBookingsCount(8);
  }, [fetchBookings]);

  useEffect(() => {
    if (
      filters.startDate &&
      filters.endDate &&
      filters.endDate < filters.startDate
    ) {
      setDateError("End date cannot be before start date.");
    } else {
      setDateError(null);
    }
  }, [filters.startDate, filters.endDate]);

  const fetchFilterOptions = async () => {
    try {
      const eventsResponse = await fetch("/api/events");
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(
          eventsData.map((e: { id: string; title: string }) => ({
            id: e.id,
            title: e.title,
          })),
        );
      }

      const usersResponse = await fetch("/api/admin/users");
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(
          usersData.map((u: { id: string; name: string }) => ({
            id: u.id,
            name: u.name,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-600/20 text-emerald-400";
      case "PENDING":
        return "bg-yellow-600/20 text-yellow-400";
      case "CANCELLED":
        return "bg-red-600/20 text-red-400";
      default:
        return "bg-gray-600/20 text-gray-400";
    }
  };

  const clearFilters = () => {
    setFilters({
      eventId: "",
      userId: "",
      startDate: "",
      endDate: "",
      status: "",
    });
  };

  const displayedBookings = bookings.slice(0, displayedBookingsCount);
  const hasMoreBookings = displayedBookingsCount < bookings.length;
  const handleShowMoreBookings = () => {
    setDisplayedBookingsCount((prev) => prev + 8);
  };

  if (loading) {
    return (
      <LoadingIndicator text="Loading bookings..." size="lg" className="h-64" />
    );
  }

  if (error) {
    return <ErrorMessage message={error} className="h-64" />;
  }

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
      <div className="font-anek space-y-8">
        <h2 className="text-2xl font-bold text-white">Booking Management</h2>

        {bookings.length > 0 && (
          <div className="rounded-xl border border-gray-600/50 bg-gray-800/50 p-6 backdrop-blur-sm">
            <h3 className="mb-6 text-lg font-semibold text-white">Summary</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
              <div className="rounded-xl border border-gray-600/50 bg-gray-800/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-600/20 p-2">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">
                      {bookings.length}
                    </p>
                    <p className="text-sm text-gray-400">Total Bookings</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-600/50 bg-gray-800/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-600/20 p-2">
                    <svg
                      className="h-5 w-5 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">
                      {bookings.filter((b) => b.status === "CONFIRMED").length}
                    </p>
                    <p className="text-sm text-gray-400">Confirmed</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-600/50 bg-gray-800/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-yellow-600/20 p-2">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-400">
                      {bookings.filter((b) => b.status === "PENDING").length}
                    </p>
                    <p className="text-sm text-gray-400">Pending</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-600/50 bg-gray-800/50 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-600/20 p-2">
                    <svg
                      className="h-5 w-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-400">
                      {bookings.filter((b) => b.status === "CANCELLED").length}
                    </p>
                    <p className="text-sm text-gray-400">Cancelled</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-10 rounded-xl border border-gray-600/50 bg-gray-800/50 p-6 backdrop-blur-sm">
          <h3 className="mb-6 text-lg font-semibold text-white">Filters</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Event
              </label>
              <select
                className="w-full rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-3 font-medium text-white backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                value={filters.eventId}
                onChange={(e) =>
                  setFilters({ ...filters, eventId: e.target.value })
                }
              >
                <option value="">All Events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                User
              </label>
              <select
                className="w-full rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-3 font-medium text-white backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                value={filters.userId}
                onChange={(e) =>
                  setFilters({ ...filters, userId: e.target.value })
                }
              >
                <option value="">All Users</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Status
              </label>
              <select
                className="w-full rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-3 font-medium text-white backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-3 font-medium text-white backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
                max={filters.endDate || undefined}
                placeholder="Select start date"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                End Date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-3 font-medium text-white backdrop-blur-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
                min={filters.startDate || undefined}
                placeholder="Select end date"
              />
            </div>
          </div>
          {dateError && (
            <div className="mt-4 text-sm font-semibold text-red-400">
              {dateError}
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={clearFilters}
              className="font-anek cursor-pointer rounded-xl border border-gray-600/50 bg-gray-700/50 px-6 py-3 font-semibold text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-500/50 hover:bg-gray-600/50 focus:ring-2 focus:ring-gray-500/30 focus:outline-none"
              disabled={!!dateError}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-600/50 bg-gray-800/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-700/50">
                <tr className="divide-x divide-gray-600/50">
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Booking ID
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Item
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30 bg-gray-800/30">
                {displayedBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-8 text-center text-base text-gray-400"
                    >
                      No bookings found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  displayedBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="divide-x divide-gray-600/50 transition-colors hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4 text-center font-mono text-xs whitespace-nowrap text-gray-300">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 text-center text-base text-white">
                        <div>
                          <div className="font-semibold whitespace-nowrap">
                            {booking.user.name}
                          </div>
                          <div className="text-sm whitespace-nowrap text-gray-400">
                            {booking.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-base text-gray-300">
                        {booking.event ? (
                          <div>
                            <div className="font-semibold whitespace-nowrap">
                              {booking.event.title}
                            </div>
                            <div className="text-sm text-gray-400">
                              {booking.event.category}
                            </div>
                          </div>
                        ) : booking.train ? (
                          <div>
                            <div className="font-semibold whitespace-nowrap">
                              {booking.train.name}
                            </div>
                            <div className="text-sm text-gray-400">
                              {booking.train.from.split("-")[0]} →{" "}
                              {booking.train.to.split("-")[0]}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">Unknown</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-base text-gray-300">
                        {booking.event?.vendor ? (
                          <div>
                            <div className="font-semibold whitespace-nowrap">
                              {booking.event.vendor.name}
                            </div>
                            <div className="text-sm whitespace-nowrap text-gray-400">
                              {booking.event.vendor.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-base text-gray-300">
                        {booking.quantity}
                      </td>
                      <td className="px-6 py-4 text-center text-base font-bold text-emerald-400">
                        ₹{booking.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center text-base">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-base text-gray-300">
                        <div>
                          <div>
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(booking.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-base whitespace-nowrap text-gray-300">
                        <div>
                          <div className="font-semibold">
                            {booking.paymentMethod}
                          </div>
                          {booking.paymentIntentId && (
                            <div className="font-mono text-xs whitespace-nowrap text-gray-400">
                              {booking.paymentIntentId}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {hasMoreBookings && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleShowMoreBookings}
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
