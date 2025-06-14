"use client";

import { User } from "@prisma/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

async function fetchUser(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (response.ok) {
      return response.json();
    }

    if (response.status === 401 || response.status === 404) {
      return null;
    }

    throw new Error(`Failed to fetch user: ${response.status}`);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}

export default function useAuth() {
  const queryClient = useQueryClient();

  const {
    data: user = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error && error.message.includes("401")) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const logOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      queryClient.setQueryData(["user"], null);

      queryClient.invalidateQueries({ queryKey: ["user"] });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateUser = (userData: User | null) => {
    queryClient.setQueryData(["user"], userData);
  };

  return {
    user,
    isLoggedIn: !!user,
    isLoading,
    error,
    logOut,
    updateUser,
  };
}
