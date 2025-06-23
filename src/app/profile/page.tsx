"use client";

import BookingCard from "@/components/ui/BookingCard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import updateProfile from "@/lib/auth/updateProfile";
import useAuth from "@/lib/hooks/useAuth";
import useBookings from "@/lib/hooks/useBookings";
import { uploadProfileImage } from "@/lib/uploadImage";
import { Booking, Event, Train } from "@prisma/client";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useState } from "react";

type BookingWithIncludes = Booking & {
  event?: Event | null;
  train?: Train | null;
};

export default function Profile() {
  const { user, isLoading, error } = useAuth();
  const {
    upcomingBookings,
    pastBookings,
    isLoading: bookingsLoading,
    cancelBooking,
  } = useBookings();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cancellingBookings, setCancellingBookings] = useState<Set<string>>(
    new Set(),
  );
  const [activeBookingTab, setActiveBookingTab] = useState<"upcoming" | "past">(
    "upcoming",
  );
  const [profileError, setProfileError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [profileSuccess, setProfileSuccess] = useState<string>("");
  const [passwordSuccess, setPasswordSuccess] = useState<string>("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string>("");
  const [upcomingDisplayedCount, setUpcomingDisplayedCount] = useState(6);
  const [pastDisplayedCount, setPastDisplayedCount] = useState(6);

  if (user && profileData.name === "") {
    setProfileData({
      name: user.name || "",
      email: user.email || "",
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
        <div className="flex w-full justify-center p-12">
          <LoadingIndicator />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
        <div className="flex w-full justify-center p-12">
          <div className="font-anek text-red-400">
            Error loading profile: {error.message}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect("/login");
  }

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
    if (profileError) setProfileError("");
    if (profileSuccess) setProfileSuccess("");
  };

  const handlePasswordUpdate = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    if (passwordError) setPasswordError("");
    if (passwordSuccess) setPasswordSuccess("");
  };

  const handleSaveProfile = async () => {
    setProfileError("");
    setProfileSuccess("");
    setIsUpdatingProfile(true);

    try {
      const response = await updateProfile(profileData.email, profileData.name);

      if (response.success) {
        setProfileSuccess("Profile updated successfully!");
        setIsEditing(false);
        window.location.reload();
      } else {
        setProfileError(response.error || "Failed to update profile");
      }
    } catch (error) {
      setProfileError("An unexpected error occurred");
      console.error("Profile update error:", error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!passwordData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }

    if (!passwordData.newPassword) {
      setPasswordError("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await updateProfile(
        undefined,
        undefined,
        passwordData.newPassword,
        passwordData.currentPassword,
      );

      if (response.success) {
        setPasswordSuccess("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setPasswordError(response.error || "Failed to change password");
      }
    } catch (error) {
      setPasswordError("An unexpected error occurred");
      console.error("Password change error:", error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploadError("");
    setIsUploadingImage(true);

    try {
      const result = await uploadProfileImage(file);

      if (result.success && result.imageUrl) {
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        setImageUploadError(result.error || "Failed to upload image");
      }
    } catch (error) {
      setImageUploadError("An unexpected error occurred while uploading image");
      console.error("Image upload error:", error);
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setCancellingBookings((prev) => new Set(prev).add(bookingId));
      await cancelBooking(bookingId);
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    } finally {
      setCancellingBookings((prev) => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const formatBookingForCard = (booking: BookingWithIncludes) => {
    return {
      id: booking.id,
      quantity: booking.quantity,
      totalPrice: booking.totalPrice,
      time:
        booking.time instanceof Date
          ? booking.time.toISOString()
          : new Date(booking.time).toISOString(),
      status: booking.status as "PENDING" | "CONFIRMED" | "CANCELLED",
      createdAt:
        booking.createdAt instanceof Date
          ? booking.createdAt.toISOString()
          : new Date(booking.createdAt).toISOString(),
      event: booking.event
        ? {
            title: booking.event.title,
            date:
              booking.event.date instanceof Date
                ? booking.event.date.toISOString()
                : new Date(booking.event.date).toISOString(),
            location: booking.event.location,
            imageUrl: booking.event.imageUrl || undefined,
            category: booking.event.category as "MOVIE" | "CONCERT",
          }
        : undefined,
      train: booking.train
        ? {
            name: booking.train.name,
            number: booking.train.number,
            departure:
              booking.train.departure instanceof Date
                ? booking.train.departure.toISOString()
                : new Date(booking.train.departure).toISOString(),
            arrival:
              booking.train.arrival instanceof Date
                ? booking.train.arrival.toISOString()
                : new Date(booking.train.arrival).toISOString(),
            from: booking.train.from,
            to: booking.train.to,
            imageUrl: booking.train.imageUrl || undefined,
          }
        : undefined,
    };
  };

  // Pagination helpers for bookings
  const displayedUpcomingBookings = upcomingBookings.slice(
    0,
    upcomingDisplayedCount,
  );
  const displayedPastBookings = pastBookings.slice(0, pastDisplayedCount);
  const hasMoreUpcomingBookings =
    upcomingDisplayedCount < upcomingBookings.length;
  const hasMorePastBookings = pastDisplayedCount < pastBookings.length;

  const handleShowMoreUpcoming = () => {
    setUpcomingDisplayedCount((prev) => prev + 6);
  };

  const handleShowMorePast = () => {
    setPastDisplayedCount((prev) => prev + 6);
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-900">
      <div className="relative overflow-hidden">
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center">
                <div className="relative">
                  <div className="h-36 w-36 overflow-hidden rounded-full border-4 border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 lg:h-44 lg:w-44">
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.name}
                        width={176}
                        height={176}
                        className="h-full w-full object-cover"
                        priority
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 122.88 122.88"
                          className="h-20 w-20 fill-white lg:h-24 lg:w-24"
                        >
                          <path d="M61.44,0A61.31,61.31,0,0,1,84.92,4.66h0A61.66,61.66,0,0,1,118.21,38l.1.24a61.39,61.39,0,0,1-.1,46.73h0A61.42,61.42,0,0,1,38,118.21h0A61.3,61.3,0,0,1,18,104.88l0,0A61.5,61.5,0,0,1,4.66,84.94l-.09-.24A61.48,61.48,0,0,1,4.66,38v0A61.37,61.37,0,0,1,18,18l0,0A61.5,61.5,0,0,1,37.94,4.66l.24-.09A61.35,61.35,0,0,1,61.44,0ZM48.78,79.89a16.44,16.44,0,0,1-1.34-1.62c-2.6-3.56-4.93-7.58-7.27-11.33-1.7-2.5-2.59-4.73-2.59-6.52s1-4.13,3-4.64a101,101,0,0,1-.18-11.73A16.86,16.86,0,0,1,41,41.11a17,17,0,0,1,7.58-9.64,19.26,19.26,0,0,1,4.11-2c2.59-1,1.34-4.91,4.19-5C63.54,24.33,74.52,30,78.8,34.68a16.91,16.91,0,0,1,4.38,11l-.27,10.57a3.31,3.31,0,0,1,2.41,2.41c.36,1.43,0,3.39-1.25,6.16h0c0,.09-.09.09-.09.18-2.75,4.53-5.62,9.78-8.78,14-1.59,2.12-2.9,1.75-1.54,3.78,6.45,8.87,19.18,7.64,27,13.55a52.66,52.66,0,0,0,9.36-54.72l-.09-.2A52.7,52.7,0,0,0,98.55,24.33h0a52.63,52.63,0,0,0-57-11.49l-.21.09a52.53,52.53,0,0,0-17,11.4h0a52.63,52.63,0,0,0-11.49,57l.09.21A52.66,52.66,0,0,0,22.19,96.3c7.85-5.91,20.58-4.68,27-13.55,1.12-1.68.83-1.52-.44-2.86Z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <label
                    className="absolute -right-1 -bottom-1 cursor-pointer rounded-full bg-gradient-to-r from-purple-600 to-blue-600 p-2 text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:scale-110 hover:from-purple-700 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    title={
                      isUploadingImage
                        ? "Uploading..."
                        : "Upload profile picture"
                    }
                  >
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                      aria-label="Upload profile picture"
                    />
                    {isUploadingImage ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    )}
                  </label>
                </div>

                <div className="text-center lg:text-left">
                  <h1 className="font-anek mb-2 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                    {user.name}
                  </h1>
                  <p className="font-anek mb-2 text-xl text-gray-300">
                    {user.email}
                  </p>
                  <p className="font-anek text-sm text-gray-400 capitalize">
                    {user.role.toLowerCase()} Account • Member since{" "}
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>

              {imageUploadError && (
                <div className="w-full max-w-md">
                  <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3">
                    <p className="font-anek text-sm text-red-400">
                      {imageUploadError}
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-6 text-center lg:min-w-[300px]">
                <div className="mb-4 flex items-center justify-center">
                  <div className="rounded-full border border-emerald-500/30 bg-emerald-600/20 p-3">
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
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="font-anek mb-2 text-xl font-bold text-white">
                  Account Balance
                </h3>
                <p className="font-anek mb-1 text-3xl font-bold text-emerald-400">
                  ₹{user.balance.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="mb-8 text-center">
              <h2 className="font-anek mb-2 text-3xl font-bold text-white">
                Account Settings
              </h2>
              <p className="font-anek text-gray-400">
                Manage your profile and security preferences
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-500/20 p-2">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-anek text-lg font-semibold text-white">
                      Profile Information
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`font-anek transform cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      isEditing
                        ? "bg-gray-600 text-gray-300 shadow-md hover:scale-105 hover:bg-gray-500"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:scale-105 hover:from-blue-700 hover:to-purple-700"
                    }`}
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        handleProfileUpdate("name", e.target.value)
                      }
                      disabled={!isEditing}
                      className="font-anek w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:border-gray-700 disabled:bg-gray-800/50"
                    />
                  </div>

                  <div>
                    <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        handleProfileUpdate("email", e.target.value)
                      }
                      disabled={!isEditing}
                      className="font-anek w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:border-gray-700 disabled:bg-gray-800/50"
                    />
                  </div>

                  {profileError && (
                    <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3">
                      <p className="font-anek text-sm text-red-400">
                        {profileError}
                      </p>
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-3">
                      <p className="font-anek text-sm text-green-400">
                        {profileSuccess}
                      </p>
                    </div>
                  )}

                  {isEditing && (
                    <div className="pt-4">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isUpdatingProfile}
                        className="font-anek w-full transform cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                      >
                        {isUpdatingProfile ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/20 p-2">
                    <svg
                      className="h-5 w-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-anek text-lg font-semibold text-white">
                    Change Password
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          handlePasswordUpdate(
                            "currentPassword",
                            e.target.value,
                          )
                        }
                        placeholder="Enter current password"
                        className="font-anek w-full rounded-lg border border-gray-600 bg-gray-700/50 py-3 pr-12 pl-4 text-white placeholder-gray-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-gray-300"
                      >
                        {showCurrentPassword ? (
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
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        ) : (
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          handlePasswordUpdate("newPassword", e.target.value)
                        }
                        placeholder="Enter new password"
                        className="font-anek w-full rounded-lg border border-gray-600 bg-gray-700/50 py-3 pr-12 pl-4 text-white placeholder-gray-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-gray-300"
                      >
                        {showNewPassword ? (
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
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        ) : (
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          handlePasswordUpdate(
                            "confirmPassword",
                            e.target.value,
                          )
                        }
                        placeholder="Confirm new password"
                        className="font-anek w-full rounded-lg border border-gray-600 bg-gray-700/50 py-3 pr-12 pl-4 text-white placeholder-gray-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-400 transition-colors duration-200 hover:text-gray-300"
                      >
                        {showConfirmPassword ? (
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
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                            />
                          </svg>
                        ) : (
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {passwordError && (
                    <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3">
                      <p className="font-anek text-sm text-red-400">
                        {passwordError}
                      </p>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-3">
                      <p className="font-anek text-sm text-green-400">
                        {passwordSuccess}
                      </p>
                    </div>
                  )}

                  <div className="pt-4">
                    <button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="font-anek w-full transform cursor-pointer rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isChangingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <div className="mb-8">
              <h2 className="font-anek mb-8 text-center text-3xl font-bold text-white">
                My Bookings
              </h2>

              <div className="flex justify-center">
                <div className="flex gap-2 rounded-lg border border-gray-600/50 bg-gray-800/50 p-1 backdrop-blur-sm">
                  <button
                    onClick={() => setActiveBookingTab("upcoming")}
                    className={`font-anek cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      activeBookingTab === "upcoming"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-anek">Upcoming</span>
                      <span
                        className={`font-anek rounded-full px-1.5 py-0.5 text-xs font-medium ${
                          activeBookingTab === "upcoming"
                            ? "bg-white/20 text-white"
                            : "bg-gray-600 text-gray-300"
                        }`}
                      >
                        {upcomingBookings.length}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveBookingTab("past")}
                    className={`font-anek cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                      activeBookingTab === "past"
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                        : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-anek">Past</span>
                      <span
                        className={`font-anek rounded-full px-1.5 py-0.5 text-xs font-medium ${
                          activeBookingTab === "past"
                            ? "bg-white/20 text-white"
                            : "bg-gray-600 text-gray-300"
                        }`}
                      >
                        {pastBookings.length}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="relative min-h-[400px]">
              {bookingsLoading ? (
                <div className="flex items-center justify-center py-20">
                  <LoadingIndicator />
                </div>
              ) : (
                <>
                  <div
                    className={`transition-all duration-500 ${activeBookingTab === "upcoming" ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}
                  >
                    {activeBookingTab === "upcoming" && (
                      <>
                        {upcomingBookings.length > 0 ? (
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {displayedUpcomingBookings.map((booking) => (
                              <BookingCard
                                key={booking.id}
                                booking={formatBookingForCard(booking)}
                                onCancel={() => handleCancelBooking(booking.id)}
                                isCancelling={cancellingBookings.has(
                                  booking.id,
                                )}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-20">
                            <p className="font-anek text-gray-400">
                              No upcoming bookings
                            </p>
                          </div>
                        )}

                        {hasMoreUpcomingBookings && (
                          <div className="mt-4 flex justify-center">
                            <button
                              onClick={handleShowMoreUpcoming}
                              className="font-anek cursor-pointer rounded-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-blue-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                            >
                              Show More
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div
                    className={`transition-all duration-500 ${activeBookingTab === "past" ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"}`}
                  >
                    {activeBookingTab === "past" && (
                      <>
                        {pastBookings.length > 0 ? (
                          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {displayedPastBookings.map((booking) => (
                              <BookingCard
                                key={booking.id}
                                booking={formatBookingForCard(booking)}
                                onCancel={() => handleCancelBooking(booking.id)}
                                isCancelling={cancellingBookings.has(
                                  booking.id,
                                )}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center py-20">
                            <p className="font-anek text-gray-400">
                              No past bookings
                            </p>
                          </div>
                        )}

                        {hasMorePastBookings && (
                          <div className="mt-4 flex justify-center">
                            <button
                              onClick={handleShowMorePast}
                              className="font-anek cursor-pointer rounded-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-blue-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                            >
                              Show More
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
