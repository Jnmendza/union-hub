importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "${NEXT_PUBLIC_FIREBASE_API_KEY}",
  authDomain: "${NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
  projectId: "${NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
  storageBucket: "${NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
  messagingSenderId: "${NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
  appId: "${NEXT_PUBLIC_FIREBASE_APP_ID}",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload,
  );
  // Customize notification here if needed
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icons/icon-192x192.png", // customized icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
