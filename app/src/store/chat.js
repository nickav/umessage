import gql from 'graphql-tag';

export const CHAT_FEED = gql`
  {
    chats {
      id
      guid

      handles {
        id
        guid
      }

      messagePage(page: { count: 1 }) {
        items {
          ... on Message {
            id
            text
            date

            attachments {
              id
              guid
              mime_type
              total_bytes
              filename
            }
          }
        }
      }
    }
  }
`;
