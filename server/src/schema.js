import { gql } from 'apollo-server-koa';

export default gql`
  scalar Date

  directive @auth on FIELD_DEFINITION

  # anything that can be paged in a PageResult
  union Pageable = Chat | Message

  # input for cursor connections
  input PageInput {
    size: Int
    cursor: String
  }

  # Page fetch results
  type PageResult {
    cursor: String
    items: [Pageable]!
  }

  # User object
  type Handle {
    id: Int!
    guid: String!
    country: String
    service: String
  }

  # Message belongs to a user and a group
  type Message {
    id: Int!
    guid: String!
    text: String!
    date: Date!
    is_from_me: Boolean!
    is_read: Boolean!
    handle_id: Int!

    associated_message_guid: String

    chat: Chat
    handle: Handle
    attachments: [Attachment]
  }

  # Top-level message groups
  type Chat {
    id: Int!
    guid: String!
    chat_identifier: String!
    display_name: String

    handles: [Handle]
    messagePage(page: PageInput = {}): PageResult
  }

  type Attachment {
    id: Int!
    guid: String!
    created_date: Date!
    filename: String!
    mime_type: String
    transfer_name: String
    total_bytes: Int
  }

  # metatags response
  type MetaInfo {
    title: String
    description: String
    image: String
  }

  type Query {
    # get all chats
    chats: [Chat] @auth

    # get a certain chat
    chat(id: Int!): Chat @auth

    # get all handles
    handles: [Handle] @auth

    # fetch metatags for a given url
    metatags(url: String!): MetaInfo @auth
  }

  type Mutation {
    # sign in user
    auth(email: String!, password: String!): String

    # set device token for notifications
    setToken(token: String!): Boolean @auth

    # create a new message to arbitrary phone numbers
    sendMessage(handleGuids: [String]!, text: String!): Message @auth

    # send message to a particular chat
    sendMessageToChat(chatId: Int!, text: String!): Message @auth

    # mark a message as read
    markRead(messageId: Int!): Boolean @auth
  }

  type Subscription {
    # called when a new message is added
    messageAdded: Message
  }

  schema {
    query: Query
    mutation: Mutation
    subscription: Subscription
  }
`;
