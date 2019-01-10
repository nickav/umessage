import * as firebase from 'firebase-admin';

import serviceAccount from '../bin/service-account.json';

export const init = () =>
  firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://umessage-b3e6c.firebaseio.com',
  });

/*
// https://firebase.google.com/docs/cloud-messaging/admin/send-messages
// See documentation on defining a message payload.
const message = {
  notification: {
    title: 'foo',
    body: 'hello!'
  },
  data: {
    score: '850',
    time: '2:45'
  },
  token: deviceToken
};
*/

export const send = (message) => firebase.messaging().send(message);

export const push = (deviceToken, notification, data) =>
  send({
    notification,
    data,
    token: deviceToken,
  });
