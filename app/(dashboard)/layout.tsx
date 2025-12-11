"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../(components)/admin-sidebar";
import { useUnion } from "../(components)/union-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUnion, isLoading } = useUnion(); // Get current union status
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 1. Wait for Union Provider to finish loading
    if (isLoading) return;

    // 2. Check if we have a union selected
    if (!currentUnion) {
      router.push("/"); // No union? Go home (which will send to Get Started)
      return;
    }

    // 3. Check Role (Must be ADMIN to see this layout)
    if (currentUnion.role === "ADMIN") {
      setAuthorized(true);
    } else {
      console.log("Access Denied: You are not an Admin of this Union.");
      router.push("/"); // Kick back to mobile app
    }
  }, [currentUnion, isLoading, router]);

  // Show loading while checking permissions
  if (isLoading || !authorized) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500'></div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen bg-slate-50 dark:bg-slate-900'>
      <AdminSidebar />
      <main className='flex-1 overflow-y-auto p-8'>{children}</main>
    </div>
  );
}
