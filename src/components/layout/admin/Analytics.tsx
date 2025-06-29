"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { Booking, Event } from "@prisma/client";
import { useEffect, useState } from "react";

interface TopEvent extends Event {
  vendor: {
    id: string;
    name: string;
    email: string;
  } | null;
  totalRevenue: number;
  totalBookings: number;
}

interface VendorPerformance {
  id: string;
  name: string;
  email: string;
  totalRevenue: number;
  totalBookings: number;
  totalEvents: number;
}

interface RecentBooking extends Booking {
  user: {
    id: string;
    name: string;
    email: string;
  };
  event: {
    id: string;
    title: string;
    category: string;
  } | null;
  train: {
    id: string;
    name: string;
    number: string;
  } | null;
}

interface AnalyticsData {
  topEvents: TopEvent[];
  vendorPerformance: VendorPerformance[];
  recentBookings: RecentBooking[];
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/analytics");
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      } else {
        setError("Failed to fetch analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setError("An error occurred while fetching analytics data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingIndicator
        text="Loading analytics..."
        size="lg"
        className="h-64"
      />
    );
  }

  if (error || !data) {
    return (
      <ErrorMessage
        message={error || "Failed to load analytics data"}
        className="h-64"
      />
    );
  }

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
      <div className="font-anek space-y-8">
        <div>
          <h2 className="mb-6 text-2xl font-bold text-white">
            Top Performing Events
          </h2>
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
                      Bookings
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30 bg-gray-800/30">
                  {data.topEvents.slice(0, 10).map((event) => (
                    <tr
                      key={event.id}
                      className="divide-x divide-gray-600/50 transition-colors hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4 text-center text-base text-white">
                        <div>
                          <div className="font-semibold">{event.title}</div>
                          <div className="text-gray-400">
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-base text-gray-300">
                        {event.category === "MOVIE"
                          ? "-"
                          : event.vendor
                            ? event.vendor.name
                            : "No vendor"}
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
                      <td className="px-6 py-4 text-center text-base font-medium text-gray-300">
                        {event.totalBookings}
                      </td>
                      <td className="px-6 py-4 text-center text-base font-bold text-emerald-400">
                        ₹{event.totalRevenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold text-white">
            Vendor Performance
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-600/50 bg-gray-800/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700/50">
                <thead className="bg-gray-700/50">
                  <tr className="divide-x divide-gray-600/50">
                    <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                      Vendor
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                      Events
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                      Bookings
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30 bg-gray-800/30">
                  {data.vendorPerformance.slice(0, 10).map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="divide-x divide-gray-600/50 transition-colors hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4 text-center text-base text-white">
                        <div>
                          <div className="font-semibold">{vendor.name}</div>
                          <div className="text-gray-400">{vendor.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-base font-medium text-gray-300">
                        {vendor.totalEvents}
                      </td>
                      <td className="px-6 py-4 text-center text-base font-medium text-gray-300">
                        {vendor.totalBookings}
                      </td>
                      <td className="px-6 py-4 text-center text-base font-bold text-emerald-400">
                        ₹{vendor.totalRevenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-2xl font-bold text-white">
            Recent Bookings
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-600/50 bg-gray-800/50 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700/50">
                <thead className="bg-gray-700/50">
                  <tr className="divide-x divide-gray-600/50">
                    <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                      User
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                      Item
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30 bg-gray-800/30">
                  {data.recentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="divide-x divide-gray-600/50 transition-colors hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4 text-center text-base text-white">
                        <div>
                          <div className="font-semibold">
                            {booking.user.name}
                          </div>
                          <div className="text-gray-400">
                            {booking.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-base text-gray-300">
                        {booking.event
                          ? booking.event.title
                          : booking.train
                            ? `${booking.train.name} (${booking.train.number})`
                            : "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-center text-base text-gray-300">
                        {booking.event ? (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm leading-5 font-semibold ${
                              booking.event.category === "MOVIE"
                                ? "bg-red-600/20 text-red-400"
                                : booking.event.category === "CONCERT"
                                  ? "bg-blue-600/20 text-blue-400"
                                  : "bg-gray-600/20 text-gray-400"
                            }`}
                          >
                            {booking.event.category === "MOVIE"
                              ? "MOVIE"
                              : booking.event.category === "CONCERT"
                                ? "CONCERT"
                                : booking.event.category}
                          </span>
                        ) : booking.train ? (
                          <span className="inline-flex rounded-full bg-green-600/20 px-3 py-1 text-sm leading-5 font-semibold text-green-400">
                            TRAIN
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-gray-600/20 px-3 py-1 text-sm leading-5 font-semibold text-gray-400">
                            UNKNOWN
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-base font-medium text-gray-300">
                        {booking.quantity}
                      </td>
                      <td className="px-6 py-4 text-center text-base font-bold text-emerald-400">
                        ₹{booking.totalPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center text-base text-gray-300">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center text-base">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm leading-5 font-semibold ${
                            booking.status === "CONFIRMED"
                              ? "bg-emerald-600/20 text-emerald-400"
                              : booking.status === "PENDING"
                                ? "bg-yellow-600/20 text-yellow-400"
                                : "bg-red-600/20 text-red-400"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
