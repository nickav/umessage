import Koa from 'koa';
import jwt from 'koa-jwt';
import compose from 'koa-compose';
import { ApolloServer } from 'apollo-server-koa';
import cors from '@koa/cors';

//import config from './config';
import {
  signInUser,
  authMiddleware,
  userFromJWT,
  isAuthenticated,
} from './auth';
import createDatabase from './db';
import { schema, resolvers, createContext, onOperation } from './data';
import attachment from './attachment';
import poll from './poll';

/* */
// Constants
const PORT = 3001;
const GRAPHQL_PATH = '/graphql';

async function init() {
  // Create Koa Server:
  const app = new Koa();
  app.context.db = await createDatabase();
  app.use(cors());

  // Create Apollo Server:
  const server = new ApolloServer({
    schema,
    context: ({ ctx, ...rest }) => createContext(app.context),
    tracing: process.env.NODE_ENV === 'development',
  });

  /*
  const middleware = compose([
    //jwt({ secret: config.JWT_SECRET, passthrough: true }),
    //authMiddleware
  ]);
  */

  // Start Server:
  const httpServer = app.listen({ port: PORT }, () => {
    console.log(
      `🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`
    );
  });

  // Connect Apollo to Koa:
  server.applyMiddleware({ app, path: GRAPHQL_PATH });
  server.installSubscriptionHandlers(httpServer);

  // Start background polling:
  poll(app.context);
}

export default init;
