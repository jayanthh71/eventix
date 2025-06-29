"use client";

import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import { Role, User } from "@prisma/client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ExtendedUser extends User {
  _count: {
    bookings: number;
    vendorEvents: number;
  };
  bookings: Array<{
    id: string;
    totalPrice: number;
    status: string;
    createdAt: string;
    event: {
      title: string;
    } | null;
    train: {
      name: string;
    } | null;
  }>;
  vendorEvents: Array<{
    id: string;
    title: string;
    description: string;
    price: number;
    date: string;
    category: string;
    createdAt: string;
    bookings: Array<{
      id: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
    }>;
  }>;
}

export default function UserManagement() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filterRole, setFilterRole] = useState<Role | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [displayedUsersCount, setDisplayedUsersCount] = useState(10);
  const [displayedBookingsCount, setDisplayedBookingsCount] = useState(5);
  const [displayedEventsCount, setDisplayedEventsCount] = useState(5);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("An error occurred while fetching users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);
      } else {
        const error = await response.json();
        console.error("Failed to delete user:", error.error);
        alert(error.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-600/20 text-red-400";
      case "VENDOR":
        return "bg-purple-600/20 text-purple-400";
      case "CUSTOMER":
        return "bg-emerald-600/20 text-emerald-400";
      default:
        return "bg-gray-600/20 text-gray-400";
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "ALL" || user.role === filterRole;
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const displayedUsers = filteredUsers.slice(0, displayedUsersCount);
  const hasMoreUsers = displayedUsersCount < filteredUsers.length;

  const handleShowMoreUsers = () => {
    setDisplayedUsersCount((prev) => prev + 10);
  };

  const handleShowMoreBookings = () => {
    setDisplayedBookingsCount((prev) => prev + 5);
  };

  const handleShowMoreEvents = () => {
    setDisplayedEventsCount((prev) => prev + 5);
  };

  const filterOptions = [
    { value: "ALL" as const, label: "All Roles" },
    { value: "CUSTOMER" as const, label: "Customers" },
    { value: "VENDOR" as const, label: "Vendors" },
  ];

  const selectedOption = filterOptions.find(
    (option) => option.value === filterRole,
  );

  if (loading) {
    return (
      <LoadingIndicator text="Loading users..." size="lg" className="h-64" />
    );
  }

  if (error || !users) {
    return (
      <ErrorMessage
        message={error || "Failed to load users"}
        className="h-64"
      />
    );
  }

  if (selectedUser) {
    return (
      <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
        <div className="font-anek space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-2 font-medium text-gray-300 transition-all duration-200 hover:border-gray-500/50 hover:bg-gray-600/50"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Users
              </button>
              <div className="h-6 w-px bg-gray-600/50"></div>
              <h2 className="text-2xl font-bold text-white">User Details</h2>
            </div>
          </div>

          <div className="rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-6">
              {selectedUser.imageUrl ? (
                <Image
                  className="h-20 w-20 rounded-full border-2 border-gray-600/50"
                  src={selectedUser.imageUrl}
                  alt={selectedUser.name}
                  width={80}
                  height={80}
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-600/50 bg-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 122.88 122.88"
                    className="h-10 w-10 fill-white"
                  >
                    <path d="M61.44,0A61.31,61.31,0,0,1,84.92,4.66h0A61.66,61.66,0,0,1,118.21,38l.1.24a61.39,61.39,0,0,1-.1,46.73h0A61.42,61.42,0,0,1,38,118.21h0A61.3,61.3,0,0,1,18,104.88l0,0A61.5,61.5,0,0,1,4.66,84.94l-.09-.24A61.48,61.48,0,0,1,4.66,38v0A61.37,61.37,0,0,1,18,18l0,0A61.5,61.5,0,0,1,37.94,4.66l.24-.09A61.35,61.35,0,0,1,61.44,0ZM48.78,79.89a16.44,16.44,0,0,1-1.34-1.62c-2.6-3.56-4.93-7.58-7.27-11.33-1.7-2.5-2.59-4.73-2.59-6.52s1-4.13,3-4.64a101,101,0,0,1-.18-11.73A16.86,16.86,0,0,1,41,41.11a17,17,0,0,1,7.58-9.64,19.26,19.26,0,0,1,4.11-2c2.59-1,1.34-4.91,4.19-5C63.54,24.33,74.52,30,78.8,34.68a16.91,16.91,0,0,1,4.38,11l-.27,10.57a3.31,3.31,0,0,1,2.41,2.41c.36,1.43,0,3.39-1.25,6.16h0c0,.09-.09.09-.09.18-2.75,4.53-5.62,9.78-8.78,14-1.59,2.12-2.9,1.75-1.54,3.78,6.45,8.87,19.18,7.64,27,13.55a52.66,52.66,0,0,0,9.36-54.72l-.09-.2A52.7,52.7,0,0,0,98.55,24.33h0a52.63,52.63,0,0,0-57-11.49l-.21.09a52.53,52.53,0,0,0-17,11.4h0a52.63,52.63,0,0,0-11.49,57l.09.21A52.66,52.66,0,0,0,22.19,96.3c7.85-5.91,20.58-4.68,27-13.55,1.12-1.68.83-1.52-.44-2.86Z" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-lg text-gray-400">{selectedUser.email}</p>
                <div className="mt-3 flex items-center gap-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getRoleColor(selectedUser.role)}`}
                  >
                    {selectedUser.role}
                  </span>
                  <span className="text-sm text-gray-400">
                    Joined{" "}
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {selectedUser.role !== "ADMIN" && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-red-600/80 to-pink-600/80 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-red-500/80 hover:to-pink-500/80"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete User
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-emerald-600/20 p-3">
                  <svg
                    className="h-6 w-6 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">
                    ₹{selectedUser.balance.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">Account Balance</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-purple-600/20 p-3">
                  <svg
                    className="h-6 w-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {selectedUser._count.bookings}
                  </p>
                  <p className="text-sm text-gray-400">Total Bookings</p>
                </div>
              </div>
            </div>
          </div>

          {selectedUser.role === "VENDOR" ? (
            <div>
              <h4 className="mb-6 text-xl font-bold text-white">
                Created Events ({selectedUser._count.vendorEvents})
              </h4>
              {selectedUser.vendorEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedUser.vendorEvents
                    .slice(0, displayedEventsCount)
                    .map((event) => (
                      <div
                        key={event.id}
                        className="rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-6 backdrop-blur-sm transition-all duration-200 hover:border-gray-500/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="text-lg font-semibold text-white">
                              {event.title}
                            </h5>
                            <p className="mt-1 text-sm text-gray-400">
                              {event.description}
                            </p>
                            <div className="mt-2 flex items-center gap-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                  event.category === "MOVIE"
                                    ? "bg-red-600/20 text-red-400"
                                    : event.category === "CONCERT"
                                      ? "bg-blue-600/20 text-blue-400"
                                      : "bg-gray-600/20 text-gray-400"
                                }`}
                              >
                                {event.category}
                              </span>
                              <span className="text-sm text-gray-400">
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-400">
                                {event.bookings.length} bookings
                              </span>
                              <span className="text-sm text-gray-400">
                                Created{" "}
                                {new Date(event.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-400">
                              ₹{event.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                  {selectedUser.vendorEvents.length > displayedEventsCount && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={handleShowMoreEvents}
                        className="font-anek cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600/80 to-purple-600/80 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-indigo-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                      >
                        Show More
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-gray-600/50 bg-gray-800/50 p-12 text-center backdrop-blur-sm">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <p className="mt-4 text-lg text-gray-400">
                    No events created yet
                  </p>
                  <p className="text-sm text-gray-500">
                    This vendor hasn&apos;t created any events.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h4 className="mb-6 text-xl font-bold text-white">
                Recent Bookings ({selectedUser.bookings.length})
              </h4>
              {selectedUser.bookings.length > 0 ? (
                <div className="space-y-4">
                  {selectedUser.bookings
                    .slice(0, displayedBookingsCount)
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-6 backdrop-blur-sm transition-all duration-200 hover:border-gray-500/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="text-lg font-semibold text-white">
                              {booking.event
                                ? booking.event.title
                                : booking.train
                                  ? booking.train.name
                                  : "Unknown"}
                            </h5>
                            <div className="mt-2 flex items-center gap-4">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                                  booking.status === "CONFIRMED"
                                    ? "bg-emerald-600/20 text-emerald-400"
                                    : booking.status === "PENDING"
                                      ? "bg-yellow-600/20 text-yellow-400"
                                      : "bg-red-600/20 text-red-400"
                                }`}
                              >
                                {booking.status}
                              </span>
                              <span className="text-sm text-gray-400">
                                {booking.event ? "Event" : "Train"}
                              </span>
                              <span className="text-sm text-gray-400">
                                Qty: 1
                              </span>
                              <span className="text-sm text-gray-400">
                                {new Date(
                                  booking.createdAt,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-400">
                              ₹{booking.totalPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                  {selectedUser.bookings.length > displayedBookingsCount && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={handleShowMoreBookings}
                        className="font-anek cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600/80 to-purple-600/80 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-indigo-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                      >
                        Show More
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-gray-600/50 bg-gray-800/50 p-12 text-center backdrop-blur-sm">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <p className="mt-4 text-lg text-gray-400">
                    No bookings found
                  </p>
                  <p className="text-sm text-gray-500">
                    This user hasn&apos;t made any bookings yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 w-full max-w-md rounded-2xl border border-gray-600/50 bg-gradient-to-br from-gray-800/95 to-gray-900/95 p-8 shadow-2xl backdrop-blur-sm">
              <div className="font-anek">
                <div className="mb-6 flex items-center gap-4">
                  <div className="rounded-full bg-red-600/20 p-3">
                    <svg
                      className="h-8 w-8 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Delete User
                    </h3>
                    <p className="text-sm text-gray-400">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="mb-6 rounded-xl border border-gray-600/30 bg-gray-700/30 p-4 backdrop-blur-sm">
                  <p className="text-gray-300">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-white">
                      &quot;{selectedUser.name}&quot;
                    </span>
                    ?
                  </p>
                  <p className="mt-2 text-sm text-gray-400">
                    This will permanently delete their account and all
                    associated bookings.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="font-anek flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-gray-600/50 bg-gray-700/50 px-6 py-3 font-semibold text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-500/50 hover:bg-gray-600/50 focus:ring-2 focus:ring-gray-500/30 focus:outline-none"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    className="font-anek flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600/80 to-pink-600/80 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-red-500/80 hover:to-pink-500/80 focus:ring-2 focus:ring-red-500/30 focus:outline-none"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
      <div className="font-anek space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search users..."
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
                      onClick={() => {
                        setFilterRole(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center px-4 py-3 text-left transition-all duration-200 first:rounded-t-xl last:rounded-b-xl hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-purple-600/20 ${
                        filterRole === option.value
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

        <div className="overflow-hidden rounded-xl border border-gray-600/50 bg-gray-800/50 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-700/50">
                <tr className="divide-x divide-gray-600/50">
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    User
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Role
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Bookings
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold tracking-wider text-gray-300 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30 bg-gray-800/30">
                {displayedUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-base text-gray-400"
                    >
                      {searchTerm || filterRole !== "ALL"
                        ? "No users match your search criteria"
                        : "No users found"}
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="divide-x divide-gray-600/50 transition-colors hover:bg-gray-700/30"
                    >
                      <td className="px-6 py-4 text-center text-base text-white">
                        <div className="flex items-center">
                          {user.imageUrl ? (
                            <Image
                              className="h-10 w-10 rounded-full"
                              src={user.imageUrl}
                              alt={user.name}
                              width={40}
                              height={40}
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-600">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 122.88 122.88"
                                className="h-6 w-6 fill-white"
                              >
                                <path d="M61.44,0A61.31,61.31,0,0,1,84.92,4.66h0A61.66,61.66,0,0,1,118.21,38l.1.24a61.39,61.39,0,0,1-.1,46.73h0A61.42,61.42,0,0,1,38,118.21h0A61.3,61.3,0,0,1,18,104.88l0,0A61.5,61.5,0,0,1,4.66,84.94l-.09-.24A61.48,61.48,0,0,1,4.66,38v0A61.37,61.37,0,0,1,18,18l0,0A61.5,61.5,0,0,1,37.94,4.66l.24-.09A61.35,61.35,0,0,1,61.44,0ZM48.78,79.89a16.44,16.44,0,0,1-1.34-1.62c-2.6-3.56-4.93-7.58-7.27-11.33-1.7-2.5-2.59-4.73-2.59-6.52s1-4.13,3-4.64a101,101,0,0,1-.18-11.73A16.86,16.86,0,0,1,41,41.11a17,17,0,0,1,7.58-9.64,19.26,19.26,0,0,1,4.11-2c2.59-1,1.34-4.91,4.19-5C63.54,24.33,74.52,30,78.8,34.68a16.91,16.91,0,0,1,4.38,11l-.27,10.57a3.31,3.31,0,0,1,2.41,2.41c.36,1.43,0,3.39-1.25,6.16h0c0,.09-.09.09-.09.18-2.75,4.53-5.62,9.78-8.78,14-1.59,2.12-2.9,1.75-1.54,3.78,6.45,8.87,19.18,7.64,27,13.55a52.66,52.66,0,0,0,9.36-54.72l-.09-.2A52.7,52.7,0,0,0,98.55,24.33h0a52.63,52.63,0,0,0-57-11.49l-.21.09a52.53,52.53,0,0,0-17,11.4h0a52.63,52.63,0,0,0-11.49,57l.09.21A52.66,52.66,0,0,0,22.19,96.3c7.85-5.91,20.58-4.68,27-13.55,1.12-1.68.83-1.52-.44-2.86Z" />
                              </svg>
                            </div>
                          )}
                          <div className="ml-4 text-left">
                            <div className="font-semibold">{user.name}</div>
                            <div className="text-sm text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-base text-gray-300">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm leading-5 font-semibold ${getRoleColor(
                            user.role,
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-base font-bold text-emerald-400">
                        ₹{user.balance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center text-base font-medium text-gray-300">
                        {user._count.bookings}
                      </td>
                      <td className="px-6 py-4 text-center text-base text-gray-300">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center text-base font-medium">
                        <button
                          onClick={() => setSelectedUser(user)}
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {hasMoreUsers && (
          <div className="flex justify-center">
            <button
              onClick={handleShowMoreUsers}
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
