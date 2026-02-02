importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyDunk1_eNq1XTw9HMnxk3Pbe6qG3IO0isA",
  authDomain: "union-hub-3d772.firebaseapp.com",
  projectId: "union-hub-3d772",
  storageBucket: "union-hub-3d772.firebasestorage.app",
  messagingSenderId: "596945799752",
  appId: "1:596945799752:web:ae73292b81653e25c3667d",
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
