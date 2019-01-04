import createLoaders from './loaders';

export { default as createLoaders } from './loaders';
export { default as schemaDirectives } from './directives';
export { default as typeDefs } from './schema';
export { default as resolvers } from './resolvers';

export const createContext = (ctx) => ({
  db: ctx.db,
  user: ctx.user,
  throw: ctx.throw,
  loaders: createLoaders(ctx),
});
