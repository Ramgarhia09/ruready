// public/firebase-messaging-sw.js - UPDATED
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCGwEMrZgmCAH0JEtimSy5plKHtQQNZJpw",
  authDomain: "r-u-ready-a306d.firebaseapp.com",
  projectId: "r-u-ready-a306d",
  storageBucket: "r-u-ready-a306d.firebasestorage.app",
  messagingSenderId: "15536772418",
  appId: "1:15536772418:web:166b404ec1108b07b264db",
});

messaging.onBackgroundMessage((payload) => {
  console.log('🔥 [SW] Background message received:', payload);  // ← Check this in DevTools > Application > Service Workers

  const data = payload.data || {};
  const { callerName = 'Someone', channelName, callType = 'audio' } = data;

  // 🔥 ALWAYS show notification for calls
  const title = `Incoming ${callType} Call 📞`;
  const options = {
    body: `${callerName} is calling... Tap to answer`,
    icon: '/firebase-logo.png',  // Add to public/ (or any 512x512 PNG)
    badge: '/badge.png',         // Small 24x24 PNG
    image: '/call-banner.jpg',   // Optional banner (1200x300 JPG)
    tag: 'incoming-call',        // Replaces duplicates
    requireInteraction: true,    // Stays until clicked/dismissed
    vibrate: [200, 100, 200, 100],  // Vibration pattern
    actions: [                  // Buttons (Chrome/Edge support)
      { action: 'accept', title: 'Accept', icon: '/accept-green.png' },
      { action: 'decline', title: 'Decline', icon: '/decline-red.png' }
    ],
    data: { channelName, callType, callerName }  // Pass to click handler
  };

  return self.registration.showNotification(title, options);
});

// 🔥 Handle clicks (join call)
self.addEventListener('notificationclick', (event) => {
  console.log('🔥 [SW] Notification clicked:', event.action);
  event.notification.close();

  const { channelName } = event.notification.data || {};
  const url = event.action === 'accept' ? `/call?channel=${channelName}` : '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      const hadWindowToFocus = clientsArr.some((windowClient) =>
        windowClient.url === url && 'focus' in windowClient
      );
      return hadWindowToFocus ? clientsArr[0].focus() : clients.openWindow(url);
    })
  );
});c