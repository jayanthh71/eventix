"use client";

import { User } from "@prisma/client";
import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logOut = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });
    setUser(null);
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getUser();
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    logOut,
  };
}
