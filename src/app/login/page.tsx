"use client";

import Link from "next/link";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4 sm:px-6">
      <form className="border-ui-blue flex w-full max-w-3xl flex-col gap-5 rounded-2xl border bg-gray-900 p-6 sm:p-10 md:p-14">
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
        <label className="font-inter flex flex-col gap-1 text-white sm:gap-2">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-lg bg-gray-800 p-2 text-sm sm:p-3 sm:text-base"
            required
            autoFocus
          />
        </label>
        <label className="font-inter flex flex-col gap-1 text-white sm:gap-2">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          className="font-inter bg-ui-blue hover:bg-ui-blue/80 mt-2 cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors sm:mt-4 sm:py-3 sm:text-base"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
