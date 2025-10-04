// Service worker without caching

// Push notification event
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nowa wiadomość w aplikacji Wolontariat',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Zobacz szczegóły',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Zamknij',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('System Wolontariatu', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Notification click received.');

  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    event.notification.close();
  }
});