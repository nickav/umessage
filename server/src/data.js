import schema from './schema';
import createLoaders from './loaders';

export { schema, createLoaders };

export const createContext = (ctx) => ({
  db: ctx.db,
  user: ctx.user,
  loaders: createLoaders(ctx),
});
