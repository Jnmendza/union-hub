"use client";
import { useEffect, useState } from "react";
import {
  getToken,
  onMessage,
  getMessaging,
  isSupported,
} from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, auth, app } from "@/lib/firebase";

export default function useFcmToken() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  const retrieveToken = async () => {
    try {
      const supported = await isSupported();
      if (!supported) {
        console.log("Firebase Messaging is not supported in this browser.");
        return;
      }

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
      if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
        return;
      }

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

      const checkPermission = async () => {
        // Wait for the next microtask to avoid a synchronous cascading render
        await Promise.resolve();
        const perm =
          "Notification" in window ? Notification.permission : "default";

        setPermission(perm as NotificationPermission);

        if (perm === "granted") {
          retrieveToken();
        }
      };

      checkPermission();
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
    let unsubscribe: (() => void) | undefined;

    const setupMessaging = async () => {
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        try {
          const supported = await isSupported();
          if (!supported) return;

          const messaging = getMessaging(app);
          unsubscribe = onMessage(messaging, (payload) => {
            console.log("Foreground message received:", payload);
            // You can show a toast here using your UI library
            // toast(payload.notification?.title, payload.notification?.body)
          });
        } catch (error) {
          console.log("Error checking for foreground messages:", error);
        }
      }
    };

    setupMessaging();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { token, permission, requestPermission };
}
