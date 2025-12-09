"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { AdminSidebar } from "../(components)/admin-sidebar"; // Ensure path is correct

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // 1. Fetch user profile from Firestore
        const profileSnap = await getDoc(doc(db, "users", user.uid));

        if (profileSnap.exists()) {
          const userData = profileSnap.data();

          // 2. Check Role (Matches your old logic: ADMIN or BOARD)
          if (userData.role === "ADMIN" || userData.role === "BOARD") {
            setAuthorized(true);
          } else {
            // Not authorized? Kick them back to the main app
            router.push("/");
          }
        } else {
          // No profile? Kick them out.
          router.push("/");
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-slate-500'></div>
      </div>
    );
  }

  // If we get here and authorized is false, the router is already redirecting.
  // We return null to prevent flashing restricted content.
  if (!authorized) return null;

  return (
    <div className='flex min-h-screen bg-slate-50 dark:bg-slate-900'>
      <AdminSidebar />
      <main className='flex-1 overflow-y-auto p-8'>{children}</main>
    </div>
  );
}
