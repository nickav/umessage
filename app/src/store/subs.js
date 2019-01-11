import gql from 'graphql-tag';

import { handleNewMessage } from '@/store/chat';

export const MESSAGE_ADDED = gql`
  subscription {
    messageAdded {
      id
      text
      date
      is_from_me
      handle_id

      chat {
        id
      }

      attachments {
        id
        mime_type
        total_bytes
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
