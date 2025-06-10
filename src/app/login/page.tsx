"use client";

import handleLogin from "@/lib/auth/handleLogin";
import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await handleLogin(formData.email, formData.password);

    if (result.success) {
      console.log("Login successful:", result.data);
    } else {
      if (result.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (result.status === 400) {
        setError("Please provide both email and password.");
      } else if (result.status === 500) {
        setError("Server error. Please try again later.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="border-ui-blue flex w-full max-w-3xl flex-col gap-5 rounded-2xl border bg-gray-900 p-6 sm:p-10 md:p-14"
      >
        <div className="text-center text-white">
          <h1 className="font-anek mb-2 text-2xl font-bold sm:text-3xl">
            Sign in to your account
          </h1>
          <h2 className="font-anek text-base font-semibold sm:text-lg">
            Or{" "}
            <Link className="text-ui-blue hover:underline" href="/register">
              create your account
            </Link>
          </h2>
        </div>

        {error && (
          <div className="font-inter rounded-lg border border-red-600 bg-red-900/50 p-3 text-sm text-red-200 sm:text-base">
            {error}
          </div>
        )}
        <label className="font-inter flex flex-col gap-1 text-white sm:gap-2">
          Email
          <input
            type="email"
            value={formData.email}
            onChange={(e) => {
              updateField("email", e.target.value);
            }}
            placeholder="Enter your email"
            className="w-full rounded-lg bg-gray-800 p-2 text-sm sm:p-3 sm:text-base"
            required
            autoFocus
            maxLength={254}
          />
        </label>
        <label className="font-inter flex flex-col gap-1 text-white sm:gap-2">
          Password
          <input
            type="password"
            value={formData.password}
            onChange={(e) => {
              updateField("password", e.target.value);
            }}
            placeholder="Enter your password"
            className="w-full rounded-lg bg-gray-800 p-2 text-sm sm:p-3 sm:text-base"
            required
          />
        </label>
        <Link
          href="/forgot-password"
          className="font-inter text-ui-blue mt-1 flex self-start text-sm hover:underline sm:text-base"
        >
          Forgot password?
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="font-inter bg-ui-blue hover:bg-ui-blue/80 disabled:bg-ui-blue/50 mt-2 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed sm:mt-4 sm:py-3 sm:text-base"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
