"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // 1. Listen for Auth Changes (Runs ONLY once on mount)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthLoaded(true); // We now know if they are logged in or not
    });

    return () => unsubscribe();
  }, []);

  // 2. Handle Routing (Runs whenever Auth state OR Path changes)
  useEffect(() => {
    if (!isAuthLoaded) return; // Wait until we know who the user is

    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/signup",
      "/forgot-password",
    ];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (user) {
      // User is Logged In
      // If they are on a public page (like Login), redirect them to Home.
      // EXCEPTION: If they are already on Home ('/'), let them stay (don't loop).
      if (isPublicRoute && pathname !== "/") {
        router.push("/");
      }
    } else {
      // User is Logged Out
      // If they try to visit a private page, kick them to Login.
      if (!isPublicRoute) {
        router.push("/login");
      }
    }
  }, [user, isAuthLoaded, pathname, router]);

  // Show loading only while we are waiting for Firebase to respond the first time
  if (!isAuthLoaded) {
    return (
      <div className='h-screen bg-slate-950 flex items-center justify-center text-slate-500'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3'></div>
        Loading app...
      </div>
    );
  }

  return <>{children}</>;
}
