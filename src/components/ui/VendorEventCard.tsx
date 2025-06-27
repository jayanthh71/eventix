import { Event, EventCategory } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

export default function VendorEventCard(event: Event) {
  const isMovie = event.category === EventCategory.MOVIE;
  const gradientClass = isMovie
    ? "from-blue-600 to-purple-600"
    : "from-purple-600 to-pink-600";
  const hoverGradientClass = isMovie
    ? "from-blue-700 to-purple-700"
    : "from-purple-700 to-pink-700";

  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-300 hover:scale-105 hover:border-gray-600 hover:shadow-2xl hover:shadow-blue-500/20">
      <div className="relative overflow-hidden">
        <Image
          src={
            event.imageUrl || event.category === EventCategory.MOVIE
              ? "/movie.jpg"
              : "/concert.jpg"
          }
          alt={event.title}
          width={300}
          height={200}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

        <div className="absolute bottom-3 left-3">
          <span className="inline-block rounded-full bg-emerald-600/90 px-3 py-1 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
            ₹{event.price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="font-anek p-5">
        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-white transition-colors duration-200 group-hover:text-blue-300">
          {event.title}
        </h3>

        <div className="mb-3 flex items-center gap-2">
          <svg
            className="h-4 w-4 flex-shrink-0 text-emerald-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <p className="truncate text-sm font-medium text-gray-400">
            {event.location}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-gray-300">
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-orange-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium text-gray-300">
              {isMovie
                ? `${event.showtimes.length} Showtimes`
                : new Date(event.date).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Link
            href={`/dashboard/edit?event=${event.id}`}
            className={`block w-full rounded-lg bg-gradient-to-r ${gradientClass} px-4 py-2 text-center text-sm font-bold text-white shadow-lg transition-all duration-200 hover:bg-gradient-to-r hover:${hoverGradientClass.replace("group-hover:", "")}`}
          >
            Edit Event
          </Link>
        </div>
      </div>
    </div>
  );
}
