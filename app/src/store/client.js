import { AsyncStorage } from 'react-native';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { withClientState } from 'apollo-link-state';
import { onError } from 'apollo-link-error';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { persistCache } from 'apollo-cache-persist';
import { getMainDefinition } from 'apollo-utilities';

import env from '@/helpers/env';
import { getToken } from './auth';

export const createClient = ({ API_URL, WS_URL }) => {
  const httpLink = new HttpLink({ uri: API_URL });

  const wsLink = new WebSocketLink({
    uri: WS_URL,
    options: {
      reconnect: true,
      lazy: true,
      connectionParams() {
        return { jwt: getToken() };
      },
    },
  });

  const cache = new InMemoryCache();

  persistCache({
    cache,
    storage: AsyncStorage,
  });

  const stateLink = withClientState({
    cache,
  });

  const authLink = (op, next) => {
    const token = getToken();

    if (token) {
      op.setContext({
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
    }

    return next(op);
  };

  const errorLink = onError((errors) => {
    console.log(errors);
  });

  const networkLink = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
    wsLink,
    httpLink
  );

  const link = ApolloLink.from([errorLink, stateLink, authLink, networkLink]);

  return new ApolloClient({ link, cache });
};

export default createClient({
  API_URL: env.API_URL,
  WS_URL: env.WS_URL,
});
