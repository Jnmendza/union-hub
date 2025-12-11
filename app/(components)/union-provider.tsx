"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

// Types
export interface Union {
  id: string;
  name: string;
  role: "ADMIN" | "MEMBER";
}

interface UnionContextType {
  currentUnion: Union | null;
  userUnions: Union[];
  isLoading: boolean;
  switchUnion: (unionId: string) => void;
}

const UnionContext = createContext<UnionContextType | undefined>(undefined);

export function UnionProvider({ children }: { children: React.ReactNode }) {
  const [currentUnion, setCurrentUnion] = useState<Union | null>(null);
  const [userUnions, setUserUnions] = useState<Union[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // If no user, stop loading (AuthProvider handles redirect to login)
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Find all unions this user belongs to
        // We look for the user's ID in the 'memberIds' array of the union document
        const q = query(
          collection(db, "unions"),
          where("memberIds", "array-contains", user.uid)
        );

        const snapshot = await getDocs(q);
        const unionsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          // We assume 'roles' is a map field: { "uid123": "ADMIN" }
          role: doc.data().roles?.[user.uid] || "MEMBER",
        })) as Union[];

        setUserUnions(unionsList);

        // 2. Auto-select logic
        if (unionsList.length > 0) {
          // Check LocalStorage for preference
          const lastId = localStorage.getItem("last_union_id");
          const found = unionsList.find((u) => u.id === lastId);

          if (found) {
            setCurrentUnion(found);
          } else {
            // Default to the first one found
            setCurrentUnion(unionsList[0]);
            localStorage.setItem("last_union_id", unionsList[0].id);
          }
        } else {
          // User has NO unions. Redirect to "Get Started" page
          // Prevent redirect loop if already there
          if (!pathname.includes("/get-started")) {
            router.push("/get-started");
          }
        }
      } catch (error) {
        console.error("Error fetching unions:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const switchUnion = (unionId: string) => {
    const target = userUnions.find((u) => u.id === unionId);
    if (target) {
      setCurrentUnion(target);
      localStorage.setItem("last_union_id", target.id);
      router.refresh(); // Refresh to ensure data re-fetches
      router.push("/"); // Go to dashboard of new union
    }
  };

  return (
    <UnionContext.Provider
      value={{ currentUnion, userUnions, isLoading, switchUnion }}
    >
      {children}
    </UnionContext.Provider>
  );
}

export const useUnion = () => {
  const context = useContext(UnionContext);
  if (context === undefined) {
    throw new Error("useUnion must be used within a UnionProvider");
  }
  return context;
};
