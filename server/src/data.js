import { makeExecutableSchema } from 'graphql-tools';

import Schema from './schema';
import Resolvers from './resolvers';
import createLoaders from './loaders';

export { default as createLoaders } from './loaders';

export const schema = makeExecutableSchema({
  typeDefs: Schema,
  resolvers: Resolvers,
});

export const createContext = (ctx) => ({
  db: ctx.db,
  user: ctx.user,
  loaders: createLoaders(ctx),
});
