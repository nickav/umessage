import gql from 'graphql-tag';

export const CHAT_FEED = gql`
  {
    chats {
      id
      guid
      display_name

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

export const CHAT_MESSAGES = gql`
  query($id: Int!, $page: PageInput = {}) {
    chat(id: $id) {
      id
      guid
      display_name

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

export const SEND_MESSSAGE = gql`
  mutation($handleGuids: [String]!, $text: String!) {
    sendMessage(handleGuids: $handleGuids, text: $text)
  }
`;
