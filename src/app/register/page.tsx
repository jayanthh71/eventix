"use client";

import handleRegister from "@/lib/auth/handleRegister";
import { Role } from "@prisma/client";
import Link from "next/link";
import { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: Role.CUSTOMER as Role,
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

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
      console.log("Registration successful:", result.data);
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
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="border-ui-blue flex w-full max-w-3xl flex-col gap-5 rounded-2xl border bg-gray-900 p-6 sm:p-10 md:p-14"
      >
        <div className="text-center text-white">
          <h1 className="font-anek mb-2 text-2xl font-bold sm:text-3xl">
            Create your account
          </h1>
          <h2 className="font-anek text-base font-semibold sm:text-lg">
            Or{" "}
            <Link className="text-ui-blue hover:underline" href="/login">
              sign in to your account
            </Link>
          </h2>
        </div>
        {error && (
          <div className="font-inter rounded-lg border border-red-600 bg-red-900/50 p-3 text-sm text-red-200 sm:text-base">
            {error}
          </div>
        )}
        <label className="font-inter flex flex-col gap-1 text-white sm:gap-2">
          Name
          <input
            type="text"
            value={formData.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-lg bg-gray-800 p-2 text-sm sm:p-3 sm:text-base"
            required
            autoFocus
            maxLength={100}
          />
        </label>
        <label className="font-inter flex flex-col gap-1 text-white sm:gap-2">
          Email
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-lg bg-gray-800 p-2 text-sm sm:p-3 sm:text-base"
            required
            maxLength={254}
          />
        </label>
        <label className="font-inter flex flex-col gap-1 text-white sm:gap-2">
          Password
          <input
            type="password"
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-lg bg-gray-800 p-2 text-sm sm:p-3 sm:text-base"
            required
            maxLength={128}
            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$"
            title="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number."
          />
        </label>
        <div className="font-inter flex flex-col gap-1 text-white sm:gap-2">
          <span>Role</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => updateField("role", Role.CUSTOMER)}
              className={`flex-1 cursor-pointer rounded-lg p-2 text-sm font-semibold transition-colors sm:p-3 sm:text-base ${
                formData.role === Role.CUSTOMER
                  ? "bg-ui-blue text-white"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => updateField("role", Role.VENDOR)}
              className={`flex-1 cursor-pointer rounded-lg p-2 text-sm font-semibold transition-colors sm:p-3 sm:text-base ${
                formData.role === Role.VENDOR
                  ? "bg-ui-blue text-white"
                  : "bg-gray-800 text-white hover:bg-gray-700"
              }`}
            >
              Vendor
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="font-inter bg-ui-blue hover:bg-ui-blue/80 mt-2 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors sm:mt-4 sm:py-3 sm:text-base"
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
