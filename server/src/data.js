import createLoaders from './loaders';

export { default as createLoaders } from './loaders';
export { default as schemaDirectives } from './directives';
export { default as typeDefs } from './schema';
export { default as resolvers } from './resolvers';

const _throw = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

export const createContext = (ctx) => ({
  db: ctx.db,
  user: ctx.user,
  throw: ctx.throw || _throw,
  loaders: createLoaders(ctx),
});
