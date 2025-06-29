"use client";

import DatePicker from "@/components/ui/DatePicker";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import useAuth from "@/lib/hooks/useAuth";
import { uploadEventImage } from "@/lib/uploadImage";
import { EventCategory } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type MovieForm = {
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  price: string;
  category: "MOVIE";
  date: string;
  showtimes: string[];
};
type ConcertForm = {
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  price: string;
  category: "CONCERT";
  date: string;
  time: string;
};
type FormState = MovieForm | ConcertForm;

export default function AdminNewEvent() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string>("");
  const [imageJustUploaded, setImageJustUploaded] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [wasSuccessfullySubmitted, setWasSuccessfullySubmitted] =
    useState(false);
  const [activeTab, setActiveTab] = useState<EventCategory>(
    EventCategory.MOVIE,
  );
  const [currentShowtimeInput, setCurrentShowtimeInput] = useState<string>("");

  const [formData, setFormData] = useState<FormState>({
    title: "",
    description: "",
    imageUrl: "",
    location: "",
    price: "",
    category: EventCategory.MOVIE,
    date: "",
    showtimes: [],
  });

  useEffect(() => {
    if (!authLoading && (!isLoggedIn || user?.role !== "ADMIN")) {
      router.push("/");
    }
  }, [authLoading, isLoggedIn, user?.role, router]);

  const cleanupUploadedImage = async () => {
    if (uploadedImageUrl && !wasSuccessfullySubmitted) {
      try {
        const response = await fetch("/api/delete/event-image", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ imageUrl: uploadedImageUrl }),
        });

        if (response.ok) {
          console.log(
            "Successfully cleaned up uploaded image:",
            uploadedImageUrl,
          );
        } else {
          console.warn("Could not clean up uploaded image:", uploadedImageUrl);
        }
      } catch (error) {
        console.error("Failed to clean up uploaded image:", error);
      }
    }
  };

  const updateField = (
    field: keyof MovieForm | keyof ConcertForm,
    value: string | EventCategory,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }) as FormState);
    if (error) setError("");
    if (success) setSuccess("");
    if (imageJustUploaded) setImageJustUploaded(false);
  };

  const removeShowtime = (idx: number) => {
    if (formData.category !== "MOVIE") return;
    setFormData((prev) => {
      if (prev.category !== "MOVIE") return prev;
      const newShowtimes = prev.showtimes.filter((_, i) => i !== idx);
      return {
        ...prev,
        showtimes: newShowtimes.length > 0 ? newShowtimes : [""],
      };
    });
  };

  const addShowtimeFromInput = () => {
    if (formData.category !== "MOVIE") return;
    const input = currentShowtimeInput.trim();
    if (!input || !validateTime(input)) return;
    if (formData.showtimes.includes(input)) return;
    setFormData((prev) => {
      if (prev.category !== "MOVIE") return prev;
      return {
        ...prev,
        showtimes: [...prev.showtimes, input],
      };
    });
    setCurrentShowtimeInput("");
  };

  const handleShowtimeInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addShowtimeFromInput();
    }
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
        setUploadedImageUrl(result.imageUrl);
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
    setUploadedImageUrl("");
    setImageJustUploaded(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      let payload;
      if (activeTab === EventCategory.MOVIE && formData.category === "MOVIE") {
        if (!formData.date) {
          setError("Please select a date for the movie");
          setIsSubmitting(false);
          return;
        }

        const validShowtimes = formData.showtimes.filter(
          (t) => t.trim() !== "",
        );
        if (validShowtimes.length === 0) {
          setError("Please enter at least one showtime");
          setIsSubmitting(false);
          return;
        }

        for (const t of validShowtimes) {
          if (!validateTime(t)) {
            setError("Please enter valid time for all showtimes");
            setIsSubmitting(false);
            return;
          }
        }

        payload = {
          ...formData,
          showtimes: validShowtimes.map((t) => `${formData.date}T${t}`),
        };
      } else if (
        activeTab === EventCategory.CONCERT &&
        formData.category === "CONCERT"
      ) {
        if (!formData.date || !validateTime(formData.time)) {
          setError("Please enter a valid date and time");
          setIsSubmitting(false);
          return;
        }
        payload = {
          ...formData,
          date: `${formData.date}T${formData.time}`,
        };
      } else {
        setError("Invalid form state");
        setIsSubmitting(false);
        return;
      }

      if (!validatePrice(formData.price)) {
        setError("Please enter a valid price (0.00 - 999999.99)");
        setIsSubmitting(false);
        return;
      }

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (response.ok) {
        setSuccess("Event created successfully!");
        setWasSuccessfullySubmitted(true);
        setUploadedImageUrl("");
        queryClient.invalidateQueries({ queryKey: ["admin-events"] });
        queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
        queryClient.invalidateQueries({ queryKey: ["events"] });
        setTimeout(() => {
          router.push("/admin");
        }, 1500);
      } else {
        setError(result.error || "Failed to create event");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    await cleanupUploadedImage();
    router.push("/admin");
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingIndicator />
      </div>
    );
  }

  if (!isLoggedIn || (user?.role !== "VENDOR" && user?.role !== "ADMIN")) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] justify-center bg-gray-900 px-4 sm:px-6">
      <div className="flex w-full max-w-2xl flex-col gap-8 p-12">
        <div className="font-anek flex flex-col items-center gap-4 text-white">
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-center text-lg text-gray-300">
            Fill in the details to create your event
          </p>
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

          <div className="mb-6 flex w-full justify-center">
            <div className="relative flex gap-2 rounded-lg border border-gray-600/50 bg-gray-800/50 p-1 backdrop-blur-sm">
              <button
                type="button"
                className={`font-anek cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === EventCategory.MOVIE
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                }`}
                onClick={() => {
                  setActiveTab(EventCategory.MOVIE);
                  setFormData({
                    title: "",
                    description: "",
                    imageUrl: "",
                    location: "",
                    price: "",
                    category: EventCategory.MOVIE,
                    date: "",
                    showtimes: [],
                  });
                  setCurrentShowtimeInput("");
                  setError("");
                  setSuccess("");
                }}
              >
                <span className="font-anek">Movie</span>
              </button>
              <button
                type="button"
                className={`font-anek cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeTab === EventCategory.CONCERT
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-700/50 hover:text-white"
                }`}
                onClick={() => {
                  setActiveTab(EventCategory.CONCERT);
                  setFormData({
                    title: "",
                    description: "",
                    imageUrl: "",
                    location: "",
                    price: "",
                    category: EventCategory.CONCERT,
                    date: "",
                    time: "",
                  });
                  setCurrentShowtimeInput("");
                  setError("");
                  setSuccess("");
                }}
              >
                <span className="font-anek">Concert</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                {formData.category === EventCategory.MOVIE
                  ? "Movie"
                  : "Concert"}{" "}
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="font-anek w-full rounded-xl border border-gray-600/50 bg-gray-700/50 px-4 py-3 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                placeholder={
                  formData.category === EventCategory.MOVIE
                    ? "Enter movie title"
                    : "Enter concert title"
                }
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
                placeholder={
                  formData.category === EventCategory.MOVIE
                    ? "Describe the movie plot, cast, and details"
                    : "Describe the concert, artists, and event details"
                }
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

            {activeTab === EventCategory.CONCERT &&
            formData.category === "CONCERT" ? (
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
                      maxLength={5}
                      inputMode="numeric"
                      className={`font-anek w-full rounded-xl border bg-gray-700/50 px-4 py-3 pr-10 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none ${
                        formData.time && !validateTime(formData.time)
                          ? "border-red-500/50"
                          : "border-gray-600/50"
                      }`}
                      placeholder="HH:MM"
                      pattern="^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
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
            ) : null}

            {activeTab === EventCategory.MOVIE &&
            formData.category === "MOVIE" ? (
              <div>
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
                      Showtimes *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={currentShowtimeInput}
                        onChange={(e) => {
                          const formatted = formatTimeInput(e.target.value);
                          setCurrentShowtimeInput(formatted);
                        }}
                        onKeyDown={handleShowtimeInputKeyDown}
                        maxLength={5}
                        inputMode="numeric"
                        className={`font-anek w-full rounded-xl border bg-gray-700/50 px-4 py-3 pr-10 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none ${
                          currentShowtimeInput &&
                          !validateTime(currentShowtimeInput)
                            ? "border-red-500/50"
                            : "border-gray-600/50"
                        }`}
                        placeholder="Enter time (HH:MM)"
                      />
                    </div>
                    {currentShowtimeInput &&
                      !validateTime(currentShowtimeInput) && (
                        <p className="font-anek mt-1 text-xs text-red-400">
                          Please enter a valid time in HH:MM format
                        </p>
                      )}
                  </div>
                </div>

                {formData.showtimes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {formData.showtimes.map((showtime, idx) => (
                      <div
                        key={idx}
                        className="group flex items-center gap-1.5 rounded-lg bg-gray-700/80 px-2.5 py-1.5 text-sm text-white backdrop-blur-sm transition-all duration-200 hover:bg-gray-600/80"
                      >
                        <svg
                          className="h-3.5 w-3.5 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="font-anek text-xs font-medium">
                          {showtime}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeShowtime(idx)}
                          className="ml-0.5 rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-600/50 hover:text-gray-300"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

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
            <button
              type="button"
              onClick={handleCancel}
              className="font-anek flex cursor-pointer items-center justify-center rounded-xl border border-gray-600/50 bg-gray-700/50 px-6 py-3 font-semibold text-gray-300 backdrop-blur-sm transition-all duration-300 hover:border-gray-500/50 hover:bg-gray-600/50 focus:ring-2 focus:ring-gray-500/30 focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
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
                  Creating...
                </>
              ) : (
                `Create ${activeTab === EventCategory.MOVIE ? "Movie" : "Concert"}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
