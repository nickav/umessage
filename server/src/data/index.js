import schema from './schema';
import createLoaders from './loaders';
//import { getSubscriptionDetails } from './subscriptions';
//import Subscription from './resolvers/Subscription';

const createContext = (ctx) => ({
  db: ctx.db,
  user: ctx.user,
  loaders: createLoaders(ctx),
});

// Provides the required context to graphQL (for each request)
const enhancer = (graphqlKoa) => (ctx, next) => {
  const context = createContext(ctx);
  return graphqlKoa({ schema, context })(ctx, next);
};

function onOperation(message, params) {
  const { name, args } = getSubscriptionDetails(schema, params);

  const subscription = Subscription[name];

  if (!subscription) return;

  const isValidOp =
    typeof subscription.validate === 'function'
      ? subscription.validate(params, args, params.context)
      : true;

  return Promise.resolve(isValidOp).then((result) =>
    result ? params : Promise.reject('Unauthorized')
  );
}

export { schema, createLoaders, createContext, onOperation };

export default enhancer;
