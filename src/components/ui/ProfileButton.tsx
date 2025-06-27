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
              <div className="relative transform rounded-full border border-gray-600 bg-gradient-to-r from-gray-700 to-gray-600 p-2 transition-all duration-200 group-hover:scale-105 group-hover:border-purple-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6 text-white transition-colors duration-200 group-hover:text-purple-200"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
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
