import gql from 'graphql-tag';

export const MESSAGE_ADDED = gql`
  subscription {
    messageAdded {
      id
      text
      date
      is_from_me

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
        console.log('MESSAGE_ADDED', data);
      },
    }),
];

export const unsubscribe = (subs) => subs.map((sub) => sub.unsubscribe());
