importScripts(
  "https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js"
);

// self.addEventListener("push", (event) => {
//   const notif = event.data.json().notification;

//   event.waitUntill(
//     self.registration.showNotification(notif.title, {
//       body: notif.body,
//       icon: notif.image,
//       data: {
//         url: notif.click_action,
//       },
//     })
//   );
// });

// self.addEventListener("notificationclick", (event) => {
//   event.waitUntill(clients.openWindow(event.notification.data.url));
// });

const firebaseConfig = {
  apiKey: "AIzaSyAzPFB3NeFWcxd6dMlEmGg3pR3r2blNRoM",
  authDomain: "connectmazjid-tv-app.firebaseapp.com",
  projectId: "connectmazjid-tv-app",
  storageBucket: "connectmazjid-tv-app.appspot.com",
  messagingSenderId: "951849592726",
  appId: "1:951849592726:web:d7884ebe237b610b9a5fb7",
  measurementId: "G-QW3YM2V1Q0",
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//   console.log(
//     "[firebase-messaging-sw.js] Received background message ",
//     payload
//   );
//   // Customize notification here
//   const notificationTitle = "Background Message Title";
//   const notificationOptions = {
//     body: "Background Message body.",
//     icon: "/firebase-logo.png",
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

// firebase-messaging-sw.js
// Initialize Firebase in the Service Worker and set up background message handling
messaging.onBackgroundMessage((payload) => {
  // Assuming you want to trigger data fetch on every background notification

  self.clients
    .matchAll({ includeUncontrolled: true, type: "window" })
    .then((clients) => {
      clients.forEach((client) => {
        console.log("called");
        client.postMessage({
          type: "FETCH_LATEST_DATA",
        });
      });
    });
});
