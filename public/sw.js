// public/sw.js - Agent dormant Genlove 💕
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : { title: 'Genlove', body: 'Nouveau message !' };
    const options = {
        body: data.body,
        icon: 'https://img.icons8.com/emoji/96/000000/heart-suit.png',
        badge: 'https://img.icons8.com/ios-filled/50/ff416c/heart-suit.png',
        vibrate: [200, 100, 200], // Vibration style WhatsApp
        data: { url: data.url || '/profile' }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(clients.openWindow(event.notification.data.url));
});
