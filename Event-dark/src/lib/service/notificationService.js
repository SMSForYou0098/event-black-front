import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Create an Echo instance and connect to the broadcast channel
const echo = new Echo({
  broadcaster: 'pusher',
  key: '64130682099f69c0b7c2',
  cluster: 'ap2',
  forceTLS: true,
});

const listenForNotifications = () => {
  echo.channel('active-users') // Listen to the active-users channel
    .listen('SendActiveUserNotification', (event) => {
      // console.log('Notification received:', event.message);
      alert(event.message); // You can replace this with a more advanced UI (like toasts)
    });
};
