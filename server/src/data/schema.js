import { makeExecutableSchema } from 'graphql-tools';

import Resolvers from './resolvers';

const Schema = `
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
    pageInfo: PageInfo!
  }

  # Whether or not more pages exist in a paged query
  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  # User object
  type Handle {
    id: Int!
    username: String!
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
    chats: [Chat]
    chat(id: Int!): Chat

    handles: [Handle]

    # fetch metatags for a given url
    metatags(url: String!): MetaInfo
  }

  type Mutation {
    # create a new message
    sendMessage(text: String!, groupId: Int!, clientTS: String!): Message
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

const schema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers,
});

export default schema;
