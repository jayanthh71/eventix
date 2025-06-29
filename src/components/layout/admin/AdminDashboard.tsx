"use client";

import Analytics from "@/components/layout/admin/Analytics";
import BookingManagement from "@/components/layout/admin/BookingManagement";
import EventManagement from "@/components/layout/admin/EventManagement";
import UserManagement from "@/components/layout/admin/UserManagement";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { useEffect, useState } from "react";

type TabType = "analytics" | "events" | "users" | "bookings";

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalBookings: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("analytics");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/analytics");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        setError("Failed to fetch dashboard statistics");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("An error occurred while fetching dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    {
      id: "analytics" as TabType,
      name: "Analytics",
      description: "Dashboard overview and insights",
    },
    {
      id: "events" as TabType,
      name: "Events",
      description: "Manage events and vendors",
    },
    {
      id: "users" as TabType,
      name: "Users",
      description: "Manage user accounts",
    },
    {
      id: "bookings" as TabType,
      name: "Bookings",
      description: "View and filter bookings",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <LoadingIndicator
          text="Loading dashboard..."
          size="lg"
          className="min-h-screen"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <ErrorMessage message={error} className="min-h-screen" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="font-anek mb-8 flex flex-col items-center gap-4 text-white">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-center text-lg text-gray-300">
            Manage users, events, and view analytics
          </p>
        </div>

        {stats && (
          <section className="font-anek mb-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 text-white">
              <h2 className="text-2xl font-bold">Admin Statistics</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-600/20 p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-6 w-6 text-blue-400"
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
                      {stats.totalUsers}
                    </p>
                    <p className="text-sm text-gray-400">Total Users</p>
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
                        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalEvents}
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
                        d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {stats.totalBookings}
                    </p>
                    <p className="text-sm text-gray-400">Total Bookings</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-600/20 p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-6 w-6 text-green-400"
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
                      ₹{stats.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">Total Revenue</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mb-8">
          <div className="relative flex justify-center">
            <div className="flex gap-2 rounded-lg border border-gray-600/50 bg-gray-800/50 p-1 backdrop-blur-sm">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`font-anek cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                  }`}
                >
                  <span className="font-anek">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === "analytics" && <Analytics />}
        {activeTab === "events" && <EventManagement />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "bookings" && <BookingManagement />}
      </div>
    </div>
  );
}
