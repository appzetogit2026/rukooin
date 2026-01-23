// Give the service worker access to Firebase Messaging.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyDvZuIOlJce5MFqM7UdaPnMxnHggOVwUnA",
  authDomain: "rukkooin-39480.firebaseapp.com",
  projectId: "rukkooin-39480",
  storageBucket: "rukkooin-39480.firebasestorage.app",
  messagingSenderId: "463389493822",
  appId: "1:463389493822:web:79fa9aabcb1d88f6965f6f"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg', // Replace with your app icon
    badge: '/vite.svg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
