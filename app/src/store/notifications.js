import { AsyncStorage } from 'react-native';
import firebase from 'react-native-firebase';

export const getToken = async () => {
  let token = await AsyncStorage.getItem('fcmToken');

  if (!token) {
    token = await firebase.messaging().getToken();
    console.log('token', token);

    if (token) {
      // user has a device token
      await AsyncStorage.setItem('fcmToken', token);
    }
  }

  return token;
};

export const init = async () => {
  const enabled = await firebase.messaging().hasPermission();

  if (!enabled) {
    console.log('requesting permission...');

    try {
      await firebase.messaging().requestPermission();
    } catch (error) {
      console.log('fcm permission rejected');
      return null;
    }
  }

  return getToken();
};

export const createListeners = ({ onOpen, onNotification } = {}) => {
  // If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened
  firebase
    .notifications()
    .getInitialNotification()
    .then((notificationOpen) => {
      if (!notificationOpen) return;

      const { title, body } = notificationOpen.notification;

      console.log(
        'notification recieved when app was closed',
        notificationOpen
      );

      onNotification && onNotification(notificationOpen.notification, 'closed');
      onOpen && onOpen(notification);
    });

  return [
    // Triggered when a particular notification has been received in foreground
    firebase.notifications().onNotification((notification) => {
      const { title, body } = notification;
      console.log('notification recieved in foreground', notification);
      onNotification && onNotification(notification, 'foreground');
      //firebase.notifications().displayNotification(notification);
    }),

    // If your app is in background, you can listen for when a notification is clicked / tapped / opened
    firebase.notifications().onNotificationOpened((notificationOpen) => {
      const { title, body } = notificationOpen.notification;
      console.log('notification recieved in background', notificationOpen);

      onNotification &&
        onNotification(notificationOpen.notification, 'background');
      onOpen && onOpen(notification);
    }),
  ];
};
