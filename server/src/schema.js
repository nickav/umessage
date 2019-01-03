import { gql } from 'apollo-server-koa';

export default gql`
  scalar Date

  # anything that can be paged in a PageResult
  union Pageable = Chat | Message

  # input for cursor connections
  input PageInput {
    count: Int
    cursor: String
  }

  # Page fetch results
  type PageResult {
    cursor: String!
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

    associated_message_guid: String
    payload_data: String

    handle: Handle
    attachments: [Attachment]
  }

  # Top-level message groups
  type Chat {
    id: Int!
    guid: String!
    chat_identifier: String!

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
    chats: [Chat]

    # get a certain chat
    chat(id: Int!): Chat

    # get all handles
    handles: [Handle]

    # fetch metatags for a given url
    metatags(url: String!): MetaInfo
  }

  type Mutation {
    # create a new message
    sendMessage(handleGuids: [String]!, text: String!): Boolean!
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
