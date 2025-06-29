"use client";

import useAuth from "@/lib/hooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function ProfileButton() {
  const { user, isLoading, isLoggedIn, logOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  if (isLoading) {
    return <></>;
  }

  return (
    <div className="flex gap-5">
      {isLoggedIn ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="group cursor-pointer"
          >
            {user?.imageUrl ? (
              <div className="relative">
                <Image
                  src={user.imageUrl}
                  alt="Profile picture"
                  width={40}
                  height={40}
                  className="h-10 w-10 transform cursor-pointer rounded-full border-2 border-gray-600 transition-all duration-200 group-hover:scale-105 group-hover:border-purple-400"
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
              </div>
            ) : (
              <div className="relative h-10 w-10 transform overflow-hidden rounded-full border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 transition-all duration-200 group-hover:scale-105 group-hover:border-purple-400">
                <div className="flex h-full w-full items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 122.88 122.88"
                    className="h-6 w-6 fill-white transition-colors duration-200 group-hover:fill-purple-200"
                  >
                    <path d="M61.44,0A61.31,61.31,0,0,1,84.92,4.66h0A61.66,61.66,0,0,1,118.21,38l.1.24a61.39,61.39,0,0,1-.1,46.73h0A61.42,61.42,0,0,1,38,118.21h0A61.3,61.3,0,0,1,18,104.88l0,0A61.5,61.5,0,0,1,4.66,84.94l-.09-.24A61.48,61.48,0,0,1,4.66,38v0A61.37,61.37,0,0,1,18,18l0,0A61.5,61.5,0,0,1,37.94,4.66l.24-.09A61.35,61.35,0,0,1,61.44,0ZM48.78,79.89a16.44,16.44,0,0,1-1.34-1.62c-2.6-3.56-4.93-7.58-7.27-11.33-1.7-2.5-2.59-4.73-2.59-6.52s1-4.13,3-4.64a101,101,0,0,1-.18-11.73A16.86,16.86,0,0,1,41,41.11a17,17,0,0,1,7.58-9.64,19.26,19.26,0,0,1,4.11-2c2.59-1,1.34-4.91,4.19-5C63.54,24.33,74.52,30,78.8,34.68a16.91,16.91,0,0,1,4.38,11l-.27,10.57a3.31,3.31,0,0,1,2.41,2.41c.36,1.43,0,3.39-1.25,6.16h0c0,.09-.09.09-.09.18-2.75,4.53-5.62,9.78-8.78,14-1.59,2.12-2.9,1.75-1.54,3.78,6.45,8.87,19.18,7.64,27,13.55a52.66,52.66,0,0,0,9.36-54.72l-.09-.2A52.7,52.7,0,0,0,98.55,24.33h0a52.63,52.63,0,0,0-57-11.49l-.21.09a52.53,52.53,0,0,0-17,11.4h0a52.63,52.63,0,0,0-11.49,57l.09.21A52.66,52.66,0,0,0,22.19,96.3c7.85-5.91,20.58-4.68,27-13.55,1.12-1.68.83-1.52-.44-2.86Z" />
                  </svg>
                </div>
              </div>
            )}
          </button>

          {isDropdownOpen && (
            <div className="font-anek absolute top-12 right-0 z-10 w-48 rounded-xl border border-gray-600/50 bg-gray-800/90 font-medium shadow-2xl backdrop-blur-sm">
              <Link
                href="/profile"
                onClick={() => setIsDropdownOpen(false)}
                className="flex w-full cursor-pointer items-center px-4 py-3 text-left text-white transition-all duration-200 first:rounded-t-xl hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-purple-600/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mr-3 h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                My Profile
              </Link>
              {(user?.role === "VENDOR" || user?.role === "ADMIN") && (
                <Link
                  href={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex w-full cursor-pointer items-center px-4 py-3 text-left text-white transition-all duration-200 first:rounded-t-xl hover:bg-gradient-to-r hover:from-indigo-600/20 hover:to-purple-600/20"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="mr-3 h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                    />
                  </svg>
                  {user?.role === "ADMIN" ? "Admin Dashboard" : "Dashboard"}
                </Link>
              )}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logOut();
                }}
                className="flex w-full cursor-pointer items-center px-4 py-3 text-left text-white transition-all duration-200 last:rounded-b-xl hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-500/20"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="mr-3 h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H2.25"
                  />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      ) : (
        <Link
          href="/login"
          className="font-anek text-md transform cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700"
        >
          Log In
        </Link>
      )}
    </div>
  );
}
