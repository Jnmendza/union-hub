"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "../(components)/admin-sidebar";
import { AdminMobileNav } from "../(components)/admin-mobile-nav";
import { useUnion } from "../(components)/union-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUnion, isLoading } = useUnion();
  // Derived state for authorization
  const isAuthorized = currentUnion?.role === "ADMIN";

  useEffect(() => {
    // 1. Wait for Union Provider to finish loading
    if (isLoading) return;

    // 2. Check if we have a union selected
    if (!currentUnion) {
      router.push("/");
      return;
    }

    // 3. Check Role (Must be ADMIN to see this layout)
    if (!isAuthorized) {
      console.log("Access Denied: You are not an Admin of this Union.");
      router.push("/");
    }
  }, [currentUnion, isLoading, router, isAuthorized]);

  // Show loading while checking permissions
  if (isLoading || !isAuthorized) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500'></div>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen bg-slate-50 dark:bg-slate-900'>
      <AdminSidebar />
      <div className='flex-1 flex flex-col min-h-screen'>
        <main className='flex-1 overflow-y-auto p-4 pb-24 md:p-8 md:pb-8'>
          {children}
        </main>
        <AdminMobileNav />
      </div>
    </div>
  );
}
