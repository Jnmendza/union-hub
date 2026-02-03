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

  // Parse data payload
  const { title, body, tag, url } = payload.data;

  const notificationTitle = title;
  const notificationOptions = {
    body: body,
    icon: "/icons/icon-192x192.png",
    tag: tag, // Grouping/Stacking key
    data: {
      url: url, // Pass URL to click handler
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle Notification Click
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // Get URL from data
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // If a window is already open, focus it
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes(urlToOpen) && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
