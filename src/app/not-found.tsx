"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gray-900 px-4 sm:px-6">
      <div className="relative text-center">
        <div className="mb-8 select-none">
          <h1 className="font-anek bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-9xl font-extrabold text-transparent sm:text-[12rem]">
            404
          </h1>
          <div className="mt-4 h-1 w-full rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-60"></div>
        </div>

        <div className="mb-12 space-y-4">
          <h2 className="font-anek text-3xl font-bold text-white">
            Oops! Page Not Found
          </h2>
          <p className="font-anek mx-auto max-w-md text-lg text-gray-400">
            The page you&apos;re looking for seems to have wandered off into the
            digital void.
          </p>
        </div>

        <div className="space-y-4 sm:flex sm:justify-center sm:space-y-0 sm:space-x-4">
          <Link
            href="/"
            className="font-anek inline-flex cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:from-blue-500/80 hover:to-purple-500/80 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
          >
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="font-anek inline-flex cursor-pointer items-center justify-center rounded-xl border border-gray-600/50 bg-gray-800/50 px-8 py-3 font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-gray-500/50 hover:bg-gray-700/50 focus:ring-2 focus:ring-gray-500/30 focus:outline-none"
          >
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
