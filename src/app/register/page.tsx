"use client";

import handleRegister from "@/lib/auth/handleRegister";
import useAuth from "@/lib/hooks/useAuth";
import { Role } from "@prisma/client";
import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: Role.CUSTOMER as Role,
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();

  const redirectUrl = useSearchParams().get("redirect") || "/";

  const updateField = (field: keyof typeof formData, value: string | Role) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await handleRegister(
      formData.name,
      formData.email,
      formData.password,
      formData.role,
    );

    if (result.success) {
      updateUser(result.data);
      redirect(redirectUrl);
    } else {
      if (result.status === 400) {
        setError("Please fill in all fields.");
      } else if (result.status === 409) {
        setError("Email is already in use.");
      } else if (result.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gray-900 px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="font-anek mb-2 text-3xl font-bold text-white">
            Create Account
          </h1>
          <p className="font-anek text-gray-400">
            Join us and start your journey today
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="font-anek rounded-2xl border border-gray-700 bg-gray-800/50 p-8 shadow-2xl backdrop-blur-sm"
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

          <div className="space-y-6">
            <div>
              <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700/50 py-3 pr-4 pl-10 text-white placeholder-gray-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                  autoFocus
                  maxLength={100}
                />
              </div>
            </div>

            <div>
              <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700/50 py-3 pr-4 pl-10 text-white placeholder-gray-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                  maxLength={254}
                />
              </div>
            </div>

            <div>
              <label className="font-anek mb-2 block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    className="h-5 w-5 text-gray-400"
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
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700/50 py-3 pr-4 pl-10 text-white placeholder-gray-400 transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                  maxLength={128}
                  pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$"
                  title="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div>
              <label className="font-anek mb-3 block text-sm font-medium text-gray-300">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateField("role", Role.CUSTOMER)}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                    formData.role === Role.CUSTOMER
                      ? "border-purple-500 bg-purple-600/20"
                      : "border-gray-600 bg-gray-700/30 hover:border-gray-500"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-center">
                    <svg
                      className={`h-6 w-6 ${
                        formData.role === Role.CUSTOMER
                          ? "text-purple-400"
                          : "text-gray-400"
                      }`}
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
                  <span
                    className={`text-sm font-medium ${
                      formData.role === Role.CUSTOMER
                        ? "text-white"
                        : "text-gray-300"
                    }`}
                  >
                    Customer
                  </span>
                  {formData.role === Role.CUSTOMER && (
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    </div>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => updateField("role", Role.VENDOR)}
                  className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                    formData.role === Role.VENDOR
                      ? "border-purple-500 bg-purple-600/20"
                      : "border-gray-600 bg-gray-700/30 hover:border-gray-500"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-center">
                    <svg
                      className={`h-6 w-6 ${
                        formData.role === Role.VENDOR
                          ? "text-purple-400"
                          : "text-gray-400"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      formData.role === Role.VENDOR
                        ? "text-white"
                        : "text-gray-300"
                    }`}
                  >
                    Vendor
                  </span>
                  {formData.role === Role.VENDOR && (
                    <div className="absolute top-2 right-2">
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full transform cursor-pointer rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-purple-700 hover:to-pink-700 disabled:scale-100 disabled:cursor-not-allowed disabled:from-gray-600 disabled:to-gray-700"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg
                    className="h-5 w-5 animate-spin text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="font-anek text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-purple-400 transition-colors duration-200 hover:text-purple-300"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense
      fallback={
        <div className="font-anek flex min-h-[calc(100vh-5rem)] items-center justify-center text-2xl font-bold text-white">
          Loading...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
