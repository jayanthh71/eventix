import { Train } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

export default function TrainCard(train: Train) {
  return (
    <Link
      href={`/trains/${train.id}`}
      className="group relative overflow-hidden rounded-xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 transition-all duration-300 hover:scale-105 hover:border-gray-600 hover:shadow-2xl hover:shadow-green-500/20"
    >
      <div className="relative overflow-hidden">
        <Image
          src={train.imageUrl || "/train.jpg"}
          alt={train.name}
          width={300}
          height={200}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

        <div className="absolute bottom-3 left-3">
          <span className="inline-block rounded-full bg-emerald-600/90 px-3 py-1 text-sm font-bold text-white shadow-lg backdrop-blur-sm">
            ₹{train.price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="font-anek p-5">
        <h3 className="mb-2 text-lg font-bold text-white transition-colors duration-200 group-hover:text-green-300">
          {train.name}
          <p className="text-sm font-medium text-gray-400">{train.number}</p>
        </h3>

        <div className="mb-4 flex items-center justify-center gap-2">
          <svg
            className="h-4 w-4 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm font-semibold text-blue-400">
            {Math.floor(
              (new Date(train.arrival).getTime() -
                new Date(train.departure).getTime()) /
                (1000 * 60 * 60),
            )}
            h{" "}
            {Math.floor(
              ((new Date(train.arrival).getTime() -
                new Date(train.departure).getTime()) %
                (1000 * 60 * 60)) /
                (1000 * 60),
            )}
            m
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-left">
            <div className="mb-1 flex items-center gap-1">
              <svg
                className="h-3 w-3 text-emerald-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-sm font-bold text-white">
                {train.from.split("-")[0]}
              </div>
            </div>
            <div className="text-xs font-medium text-emerald-400">
              {new Date(train.departure).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          </div>

          <div className="mx-3 flex flex-1 items-center">
            <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-emerald-500 to-red-500"></div>
          </div>

          <div className="text-right">
            <div className="mb-1 flex items-center justify-end gap-1">
              <div className="text-sm font-bold text-white">
                {train.to.split("-")[0]}
              </div>
              <svg
                className="h-3 w-3 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                  clipRule="evenodd"
                  transform="rotate(180 10 10)"
                />
              </svg>
            </div>
            <div className="text-xs font-medium text-red-400">
              {new Date(train.arrival).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
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
              {new Date(train.departure).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="w-full rounded-lg bg-gradient-to-r from-green-600 to-blue-600 px-4 py-2 text-center text-sm font-bold text-white shadow-lg transition-all duration-200 group-hover:from-green-700 group-hover:to-blue-700">
          Book Journey
        </div>
      </div>
    </Link>
  );
}
