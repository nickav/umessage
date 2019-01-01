import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import jwt from 'koa-jwt';
import compose from 'koa-compose';
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import cors from '@koa/cors';

import config from './config';
import {
  signInUser,
  authMiddleware,
  userFromJWT,
  isAuthenticated,
} from './auth';
import createDatabase from './db';
import enhancer, { schema, createContext, onOperation } from './data';

/* */
// Constants
const app = new Koa();
const router = new Router();
const PORT = 3001;
const GRAPHQL_PATH = '/graphql';
const SUBSCRIPTIONS_PATH = '/subscriptions';
let didBindDevHelpers = false;

app.use(cors());

/* */
// Helpers
function devHelpers(middleware) {
  const token = config.DEV_TOKEN;
  router.get(
    '/graphiql',
    graphiqlKoa({
      endpointURL: GRAPHQL_PATH,
      subscriptionsEndpoint: `ws://localhost:${PORT}${SUBSCRIPTIONS_PATH}`,
      passHeader: `'Authorization': 'Bearer ${token}'`,
    })
  );

  /*
  router.get('/jwt', middleware, async ctx => {
    const id = ctx.request.query.id;
    const token = await signInUser(ctx, id);
    ctx.body = token;
  });
  */

  didBindDevHelpers = true;
}

function printServerInfo() {
  console.log(`Server running on port http://localhost:${PORT}`);
  console.log(`----`);
  console.log(`GraphQL Endpoint:      http://localhost:${PORT}${GRAPHQL_PATH}`);
  if (didBindDevHelpers) {
    console.log(`GraphIQL Endpoint:     http://localhost:${PORT}/graphiql`);
  }
  console.log(
    `GraphQL Subscriptions: ws://localhost:${PORT}${SUBSCRIPTIONS_PATH}`
  );
}

async function init() {
  app.context.db = await createDatabase();

  /* */
  // Helpers
  const middleware = compose([
    //jwt({ secret: config.JWT_SECRET, passthrough: true }),
    //authMiddleware
  ]);

  /* */
  // Routes
  router.post(GRAPHQL_PATH, bodyParser(), middleware, enhancer(graphqlKoa));
  router.get(GRAPHQL_PATH, middleware, enhancer(graphqlKoa));

  app.use(router.routes());
  app.use(router.allowedMethods());

  if (process.env.NODE_ENV === 'development') {
    devHelpers(middleware);
  }

  /* */
  // Servers
  const server = app.listen(PORT, printServerInfo);

  /*
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
      onConnect(params, ws) {
        const { jwt } = params;
        // resolves to the context
        return isAuthenticated(userFromJWT(app.context.db, jwt)).then(user =>
          createContext({ ...app.context, user })
        );
      },
      onOperation
    },
    {
      server,
      path: SUBSCRIPTIONS_PATH
    }
  );
  */
}

export default init;
