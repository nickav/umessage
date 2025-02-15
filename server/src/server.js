import Koa from 'koa';
import jwt from 'koa-jwt';
import Router from 'koa-router';
import compose from 'koa-compose';
import cors from '@koa/cors';
import { ApolloServer } from 'apollo-server-koa';

import config from './config';
import { getUserFromJwt } from './auth';
import createDatabase from './db';
import { typeDefs, resolvers, schemaDirectives, createContext } from './data';
import attachment from './attachment';
import poll from './poll';
import * as notifications from './notifications';

/* */
// Constants
async function init({ host, port }) {
  // Create Koa Server:
  const app = new Koa();
  const router = new Router();

  app.context.db = await createDatabase();

  router.get('/attachments/:id', attachment);

  const middleware = compose([
    jwt({ secret: config.JWT_SECRET, passthrough: true }),
  ]);

  app.use(middleware);
  app.use(cors());
  app.use(router.routes());
  app.use(router.allowedMethods());

  // Create Apollo Server:
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    schemaDirectives,
    context: ({ ctx, connection }) => {
      return createContext({
        ...app.context,
        user: connection ? connection.context.user : ctx.state.user,
      });
    },
    subscriptions: {
      onConnect: (params, webSocket) => {
        console.log('--- Connected to client using token:', !!params.token);

        return;
        return getUserFromJwt(app.context, params.token).then((user) => ({
          user,
        }));
      },
    },
    tracing: process.env.NODE_ENV === 'development',
  });

  // Start Server:
  const httpServer = app.listen({ host, port }, () => {
    console.log(
      `🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
    );
  });

  // Connect Apollo to Koa:
  server.applyMiddleware({ app, path: '/graphql' });
  server.installSubscriptionHandlers(httpServer);

  // Start background polling:
  poll(app.context, { interval: 400 });

  // Setup push notification service
  notifications.init();
}

export default init;
