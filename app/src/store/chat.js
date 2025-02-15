import gql from 'graphql-tag';

export const MESSAGE_FRAGMENT = gql`
  fragment MessageFragment on Message {
    id
    text
    date
    is_from_me
    handle_id
    is_read

    attachments {
      id
      mime_type
      total_bytes
    }
  }
`;

export const CHAT_FEED = gql`
  ${MESSAGE_FRAGMENT}
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
            ...MessageFragment
          }
        }
      }
    }
  }
`;

export const CHAT_MESSAGES = gql`
  ${MESSAGE_FRAGMENT}
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
            ...MessageFragment
          }
        }
      }
    }
  }
`;

export const SEND_MESSSAGE = gql`
  ${MESSAGE_FRAGMENT}
  mutation($handleGuids: [String]!, $text: String!) {
    sendMessage(handleGuids: $handleGuids, text: $text) {
      ...MessageFragment
    }
  }
`;

export const SEND_MESSSAGE_TO_CHAT = gql`
  ${MESSAGE_FRAGMENT}
  mutation($chatId: Int!, $text: String!) {
    sendMessageToChat(chatId: $chatId, text: $text) {
      ...MessageFragment
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
      const { messagePage } = data.chat;

      // update existing message
      const index = messagePage.items.findIndex((e) => e.id === message.id);
      if (index >= 0) {
        messagePage.items = messagePage.items.map(
          (e) => (e.id === message.id ? message : e)
        );
        return;
      }

      // append new message
      messagePage.items = messagePage.items.filter((e) => e.id > 0);
      messagePage.items.unshift(message);
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
