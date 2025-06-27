"use client";

import DatePicker from "@/components/ui/DatePicker";
import ErrorMessage from "@/components/ui/ErrorMessage";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import useAuth from "@/lib/hooks/useAuth";
import { uploadEventImage } from "@/lib/uploadImage";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function EditEventContent() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event");
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [imageJustUploaded, setImageJustUploaded] = useState(false);
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  const [newlyUploadedImageUrl, setNewlyUploadedImageUrl] = useState("");
  const [wasSuccessfullySubmitted, setWasSuccessfullySubmitted] =
    useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    date: "",
    time: "",
    location: "",
    price: "",
  });

  useEffect(() => {
    if (
      !authLoading &&
      (!isLoggedIn || (user?.role !== "VENDOR" && user?.role !== "ADMIN"))
    ) {
      router.push("/");
      return;
    }

    if (!eventId) {
      setError("Event ID not provided");
      setIsLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events?id=${eventId}`);
        const result = await response.json();

        if (response.ok) {
          const event = result.event;
          const eventDate = new Date(event.date);

          if (isNaN(eventDate.getTime())) {
            setError("Invalid event date format");
            return;
          }

          setFormData({
            title: event.title || "",
            description: event.description || "",
            imageUrl: event.imageUrl || "",
            date: eventDate.toISOString().split("T")[0],
            time: eventDate.toTimeString().slice(0, 5),
            location: event.location || "",
            price: event.price?.toString() || "",
          });

          setOriginalImageUrl(event.imageUrl || "");
          setImageUploadError("");
          setImageJustUploaded(false);

          console.log("Fetched event data:", event);
          console.log("Set imageUrl:", event.imageUrl || "");
        } else {
          setError(result.error || "Failed to fetch event");
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event data");
      } finally {
        setIsLoading(false);
      }
    };

    if (isLoggedIn && eventId) {
      fetchEvent();
    }
  }, [authLoading, isLoggedIn, user?.role, router, eventId]);

  const cleanupNewlyUploadedImage = async () => {
    if (
      newlyUploadedImageUrl &&
      newlyUploadedImageUrl !== originalImageUrl &&
      !wasSuccessfullySubmitted
    ) {
      try {
        const response = await fetch("/api/delete/event-image", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl: newlyUploadedImageUrl }),
        });

        if (response.ok) {
          console.log(
            "Successfully cleaned up newly uploaded image:",
            newlyUploadedImageUrl,
          );
        } else {
          console.warn(
            "Could not clean up newly uploaded image:",
            newlyUploadedImageUrl,
          );
        }
      } catch (error) {
        console.error("Failed to clean up newly uploaded image:", error);
      }
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateTime = (timeString: string): boolean => {
    if (!timeString) return false;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
  };

  const formatTimeInput = (value: string): string => {
    const cleaned = value.replace(/[^\d]/g, "");

    if (cleaned.length > 4) {
      return cleaned.slice(0, 4);
    }

    if (cleaned.length === 0) {
      return "";
    } else if (cleaned.length === 1) {
      return cleaned;
    } else if (cleaned.length === 2) {
      const hours = parseInt(cleaned);
      if (hours > 23) {
        return cleaned.slice(0, 1);
      }
      return cleaned + ":";
    } else if (cleaned.length === 3) {
      const hours = parseInt(cleaned.slice(0, 2));
      const firstMinute = parseInt(cleaned.slice(2, 3));

      if (hours > 23) {
        return cleaned.slice(0, 1);
      }

      if (firstMinute > 5) {
        return cleaned.slice(0, 2) + ":";
      }

      return cleaned.slice(0, 2) + ":" + cleaned.slice(2);
    } else if (cleaned.length === 4) {
      const hours = parseInt(cleaned.slice(0, 2));
      const minutes = parseInt(cleaned.slice(2, 4));

      if (hours > 23) {
        return cleaned.slice(0, 1);
      }

      if (minutes > 59) {
        return cleaned.slice(0, 2) + ":" + cleaned.slice(2, 3);
      }

      return cleaned.slice(0, 2) + ":" + cleaned.slice(2, 4);
    }

    return cleaned;
  };

  const validatePrice = (priceString: string): boolean => {
    if (!priceString || priceString.trim() === "") return false;

    if (
      priceString.includes("-") ||
      priceString.includes("+") ||
      priceString.toLowerCase().includes("e") ||
      priceString.includes(" ")
    ) {
      return false;
    }

    const price = parseFloat(priceString);
    return !isNaN(price) && price >= 0 && price <= 999999 && isFinite(price);
  };

  const formatPriceInput = (value: string): string => {
    let cleaned = value.replace(/[^\d.]/g, "");

    if (cleaned.length > 1 && cleaned[0] === "0" && cleaned[1] !== ".") {
      cleaned = cleaned.replace(/^0+/, "");
    }

    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    const finalParts = cleaned.split(".");
    if (finalParts.length === 2 && finalParts[1].length > 2) {
      cleaned = finalParts[0] + "." + finalParts[1].slice(0, 2);
    }

    const beforeDecimal = cleaned.split(".")[0];
    if (beforeDecimal.length > 6) {
      const afterDecimal = cleaned.includes(".")
        ? "." + cleaned.split(".")[1]
        : "";
      cleaned = beforeDecimal.slice(0, 6) + afterDecimal;
    }

    if (cleaned === ".") {
      cleaned = "";
    }

    return cleaned;
  };

  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const { value, selectionStart } = input;

    if (e.key === "Backspace" && selectionStart === 3 && value[2] === ":") {
      e.preventDefault();
      const newValue = value.slice(0, 2);
      updateField("time", newValue);
      setTimeout(() => {
        input.setSelectionRange(2, 2);
      }, 0);
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
      const result = await uploadEventImage(file);

      if (result.success && result.imageUrl) {
        console.log("Image upload successful, URL:", result.imageUrl);
        setFormData((prev) => ({ ...prev, imageUrl: result.imageUrl! }));

        if (result.imageUrl !== originalImageUrl) {
          setNewlyUploadedImageUrl(result.imageUrl);
        }

        setImageJustUploaded(true);
      } else {
        console.error("Image upload failed:", result.error);
        setImageUploadError(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setImageUploadError("An unexpected error occurred while uploading image");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const handleImageRemove = async () => {
    if (!formData.imageUrl) return;

    try {
      const response = await fetch("/api/delete/event-image", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: formData.imageUrl }),
      });

      if (response.ok) {
        console.log("Successfully deleted image from S3:", formData.imageUrl);
      } else {
        const errorData = await response.json();
        console.warn(
          "Could not delete image from S3:",
          errorData.error || "Unknown error",
        );
      }
    } catch (error) {
      console.error("Failed to delete image from S3:", error);
    }

    setFormData((prev) => ({ ...prev, imageUrl: "" }));

    if (formData.imageUrl === newlyUploadedImageUrl) {
      setNewlyUploadedImageUrl("");
    }

    setImageJustUploaded(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      if (!validateTime(formData.time)) {
        setError("Please enter a valid time in HH:MM format (24-hour)");
        setIsSubmitting(false);
        return;
      }

      if (!validatePrice(formData.price)) {
        setError("Please enter a valid price (0.00 - 999999.99)");
        setIsSubmitting(false);
        return;
      }

      const eventDateTime = new Date(`${formData.date}T${formData.time}`);

      if (eventDateTime <= new Date()) {
        setError("Event date must be in the future");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch(`/api/events?id=${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          imageUrl: formData.imageUrl || null,
          date: eventDateTime.toISOString(),
          location: formData.location,
          price: parseFloat(formData.price),
          category: "CONCERT",
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Event updated successfully!");

        setWasSuccessfullySubmitted(true);
        setNewlyUploadedImageUrl("");

        queryClient.invalidateQueries({ queryKey: ["vendor-events"] });
        queryClient.invalidateQueries({ queryKey: ["vendor-stats"] });

        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(result.error || "Failed to update event");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!eventId) return;

    setError("");
    setSuccess("");
    setIsDeleting(true);

    try {
      if (formData.imageUrl && formData.imageUrl !== originalImageUrl) {
        try {
          const response = await fetch("/api/delete/event-image", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageUrl: formData.imageUrl }),
          });

          if (response.ok) {
            console.log(
              "Successfully cleaned up newly uploaded image:",
              formData.imageUrl,
            );
          } else {
            console.warn(
              "Could not clean up newly uploaded image:",
              formData.imageUrl,
            );
          }
        } catch (error) {
          console.error("Failed to clean up newly uploaded image:", error);
        }
      }

      const response = await fetch(`/api/events?id=${eventId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Event deleted successfully!");

        setWasSuccessfullySubmitted(true);

        queryClient.invalidateQueries({ queryKey: ["vendor-events"] });
        queryClient.invalidateQueries({ queryKey: ["vendor-stats"] });

        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(result.error || "Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = async () => {
    await cleanupNewlyUploadedImage();
    router.push("/dashboard");
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (!isLoggedIn || (user?.role !== "VENDOR" && user?.role !== "ADMIN")) {
    return null;
  }

  if (!eventId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ErrorMessage message="The event ID was not provided." />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
      <div className="flex w-full max-w-2xl flex-col gap-8 p-12">
        <div className="font-anek flex flex-col items-center gap-4 text-white">
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-center text-lg text-gray-300">Edit your event</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm"
        >
          {error && (
            <div className="mb-6 rounded-lg border border-red-600/50 bg-red-900/30 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-anek text-sm text-red-200">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg border border-emerald-600/50 bg-emerald-900/30 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-anek text-sm text-emerald-200">
                  {success}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="font-anek w-full rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                placeholder="Enter concert title"
                required
              />
            </div>

            <div>
              <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                rows={4}
                className="font-anek w-full resize-none rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                placeholder="Describe your concert event"
                required
              />
            </div>

            <div>
              <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                Event Image
              </label>

              <div className="mb-4">
                <div className="relative h-48 w-full overflow-hidden rounded-xl border border-gray-600/50 bg-gradient-to-r from-gray-800/80 to-gray-700/80">
                  {isUploadingImage ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg
                          className="h-8 w-8 animate-spin text-indigo-400"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span className="font-anek text-sm text-gray-300">
                          Uploading image...
                        </span>
                      </div>
                    </div>
                  ) : formData.imageUrl ? (
                    <>
                      <Image
                        src={formData.imageUrl}
                        alt="Event preview"
                        width={400}
                        height={192}
                        className="h-full w-full object-cover"
                        priority
                      />
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute top-2 right-2 cursor-pointer rounded-full bg-red-600/80 p-1 text-white backdrop-blur-sm transition-colors hover:bg-red-600"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="flex flex-col items-center gap-3">
                        <svg
                          className="h-12 w-12 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                          />
                        </svg>
                        <span className="font-anek text-sm text-gray-400">
                          No image selected
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="font-anek cursor-pointer rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-2 text-sm text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-500/50 hover:bg-gray-600/50 focus:ring-2 focus:ring-gray-500/30">
                  {isUploadingImage ? (
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Uploading...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                      >
                        <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                      </svg>
                      Choose Image
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </label>

                {imageJustUploaded && formData.imageUrl && (
                  <span className="font-anek text-sm text-emerald-400">
                    Image uploaded successfully
                  </span>
                )}
              </div>

              {imageUploadError && (
                <div className="mt-2 rounded-lg border border-red-600/50 bg-red-900/30 p-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-red-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="font-anek text-xs text-red-200">
                      {imageUploadError}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                  Date *
                </label>
                <DatePicker
                  value={formData.date}
                  onDateChangeAction={(date) => updateField("date", date)}
                  minDate={new Date().toISOString().split("T")[0]}
                  required
                  placeholder="Select event date"
                />
              </div>
              <div>
                <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                  Time *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => {
                      const formatted = formatTimeInput(e.target.value);
                      updateField("time", formatted);
                    }}
                    onKeyDown={handleTimeKeyDown}
                    className={`font-anek w-full rounded-xl border bg-gray-700/50 px-4 py-3 pr-10 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none ${
                      formData.time && !validateTime(formData.time)
                        ? "border-red-500/50"
                        : "border-gray-600/50"
                    }`}
                    placeholder="HH:MM"
                    pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
                    maxLength={5}
                    inputMode="numeric"
                    required
                  />
                </div>
                {formData.time && !validateTime(formData.time) && (
                  <p className="font-anek mt-1 text-xs text-red-400">
                    Please enter a valid time in HH:MM format
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => updateField("location", e.target.value)}
                className="font-anek w-full rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                placeholder="Enter venue location"
                required
              />
            </div>

            <div>
              <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                Ticket Price (₹) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => {
                  const formatted = formatPriceInput(e.target.value);
                  updateField("price", formatted);
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "-" ||
                    e.key === "+" ||
                    e.key === "e" ||
                    e.key === "E"
                  ) {
                    e.preventDefault();
                  }
                }}
                min="0"
                step="0.01"
                className="font-anek w-full [appearance:textfield] rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={handleCancel}
                className="font-anek flex items-center justify-center rounded-xl border border-gray-600/50 bg-gray-700/50 px-6 py-3 font-semibold text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-500/50 hover:bg-gray-600/50 focus:ring-2 focus:ring-gray-500/30 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="font-anek flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-red-600/80 to-red-700/80 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-red-500/80 hover:to-red-600/80 focus:ring-2 focus:ring-red-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="mr-2 h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg
                      className="mr-2 h-5 w-5"
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
                    Delete Event
                  </>
                )}
              </button>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || isDeleting}
              className="font-anek flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600/80 to-purple-600/80 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-indigo-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="mr-2 h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Event"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditEvent() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoadingIndicator />
        </div>
      }
    >
      <EditEventContent />
    </Suspense>
  );
}
