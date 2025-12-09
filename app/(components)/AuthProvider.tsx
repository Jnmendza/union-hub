"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Standard Firebase Listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const publicRoutes = ["/login", "/register", "/forgot-password"];
      const isPublicRoute = publicRoutes.includes(pathname);

      if (user) {
        // If logged in and on login page, go home
        if (isPublicRoute) {
          router.push("/");
        }
      } else {
        // If not logged in and on protected page, go to login
        if (!isPublicRoute) {
          router.push("/login");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className='h-screen bg-slate-950 flex items-center justify-center text-slate-500'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3'></div>
        Loading app...
      </div>
    );
  }

  return <>{children}</>;
}
