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

export const GET_CHAT = gql`
  query ($id: Int!, $page: PageInput = {}) {
    chat(id: $id) {
      id
      guid
      chat_identifier

      handles {
        id
        guid
      }

      messagePage(page: $page) {
        cursor
        items {
          ... on Message {
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
      }
    }
  }
`;
