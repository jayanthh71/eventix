"use client";

import AdminDashboard from "@/components/layout/admin/AdminDashboard";
import LoadingIndicator from "@/components/ui/LoadingIndicator";
import useAuth from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Admin() {
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!isLoggedIn || user?.role !== "ADMIN")) {
      router.push("/");
    }
  }, [authLoading, isLoggedIn, user?.role, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <LoadingIndicator
          text="Verifying admin access..."
          size="lg"
          className="min-h-screen"
        />
      </div>
    );
  }

  if (!isLoggedIn || user?.role !== "ADMIN") {
    return null;
  }

  return <AdminDashboard />;
}
