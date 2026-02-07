"use client";
import { useEffect, useState } from "react";
import { getToken, onMessage, getMessaging } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth, app } from "@/lib/firebase";

export default function useFcmToken() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  const retrieveToken = async () => {
    try {
      const messaging = getMessaging(app);
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      if (currentToken) {
        setToken(currentToken);
        // console.log("FCM Token:", currentToken);
      } else {
        console.log(
          "No registration token available. Request permission to generate one.",
        );
      }
    } catch (error) {
      console.log("An error occurred while retrieving token. ", error);
    }
  };

  const requestPermission = async () => {
    // only run on client
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        await retrieveToken();
      }
    } catch (error) {
      console.log("Error requesting permission", error);
    }
  };

  // 1. Initial Permission Check
  // 1. Initial Permission Check & Token Retrieval
  // 1. Initial Permission Check & Token Retrieval
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Clear app badge
      const clearBadge = () => {
        if ("setAppBadge" in navigator) {
          navigator.setAppBadge(0).catch((e) => console.log("Badge error", e));
        }
      };

      // Clear on mount
      clearBadge();

      // Clear when app comes to foreground
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          clearBadge();
        }
      });

      const perm = Notification.permission;
      setPermission(perm);
      if (perm === "granted") {
        retrieveToken();
      }
    }
  }, []);

  // 2. Sync Token to Firestore when User Authenticates
  useEffect(() => {
    if (!token) return;

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const tokenRef = doc(db, "users", user.uid, "fcmTokens", token);
          await setDoc(
            tokenRef,
            {
              token: token,
              lastSeen: serverTimestamp(),
              platform: "web",
            },
            { merge: true },
          );
        } catch (error) {
          console.error("Error saving FCM token to Firestore:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [token]);

  // 3. Listen for Foreground Messages
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      try {
        const messaging = getMessaging(app);
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log("Foreground message received:", payload);
          // You can show a toast here using your UI library
          // toast(payload.notification?.title, payload.notification?.body)
        });
        return () => unsubscribe();
      } catch (error) {
        console.log("Error checking for foreground messages:", error);
      }
    }
  }, []);

  return { token, permission, requestPermission };
}
