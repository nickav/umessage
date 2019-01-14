import gql from 'graphql-tag';

import { handleNewMessage, MESSAGE_FRAGMENT } from '@/store/chat';

export const MESSAGE_ADDED = gql`
  ${MESSAGE_FRAGMENT}
  subscription {
    messageAdded {
      ...MessageFragment

      chat {
        id
      }
    }
  }
`;

export const subscribe = (client) => [
  client
    .subscribe({
      query: MESSAGE_ADDED,
    })
    .subscribe({
      next({ data }) {
        const {
          messageAdded: { chat, ...message },
        } = data;

        console.log('subscription MESSAGE_ADDED');
        handleNewMessage(client.cache, message, chat.id);
      },
    }),
];

export const unsubscribe = (subs) => subs.map((sub) => sub.unsubscribe());
