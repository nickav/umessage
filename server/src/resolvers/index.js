import GraphQLDate from 'graphql-date';

import Query from './Query';
import Mutation from './Mutation';
import Subscription from './Subscription';

import Chat from './Chat';
import Message from './Message';
import Pageable from './Pageable';

export default {
  Date: GraphQLDate,

  Query,
  Mutation,
  Subscription,

  Chat,
  Message,

  Pageable,
};
