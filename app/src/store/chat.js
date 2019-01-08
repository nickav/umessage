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

      messagePage(page: { size: 1 }) {
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
    sendMessage(handleGuids: $handleGuids, text: $text) {
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

export const handleNewMessage = (cache, message, chatId) => {
  console.log('handleNewMessage', message, chatId);

  // update individual chat
  cache.readWriteQuery({
    query: CHAT_MESSAGES,
    variables: {
      id: chatId,
      page: { size: 30 },
    },
    data: (data) => {
      data.chat.messagePage.items = data.chat.messagePage.items.filter(
        (e) => e.id > 0
      );
      data.chat.messagePage.items.unshift(message);
    },
  });

  // update list of chats
  cache.readWriteQuery({
    query: CHAT_FEED,
    variables: {},
    data: (data) => {
      const index = data.chats.findIndex((chat) => chat.id === chatId);

      if (index >= 0) {
        data.chats[index].messagePage.items = [message];
      }
    },
  });
};
