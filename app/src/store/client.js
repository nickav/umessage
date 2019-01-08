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
import { setContext } from 'apollo-link-context';

import env from '@/helpers/env';
import { getToken } from './auth';

const cacheEnhancer = (cache) => {
  cache.readWriteQuery = (query) => {
    let data = null;

    try {
      data = cache.readQuery(query);
    } catch (err) {
      console.log('readWriteQuery', err);
    }

    if (data) {
      if (typeof query.data == 'function') {
        query.data(data);
      }

      cache.writeQuery({ ...query, data });
    }

    return data;
  };

  return cache;
};

export const createClient = (API_URL) => {
  const httpLink = new HttpLink({ uri: API_URL });

  const wsLink = new WebSocketLink({
    uri: API_URL.replace(/^https?:\/\//, 'ws://'),
    options: {
      reconnect: true,
      lazy: true,
      connectionParams() {
        return { token: null };
      },
    },
  });

  const cache = cacheEnhancer(new InMemoryCache());

  persistCache({
    cache,
    storage: AsyncStorage,
    trigger: 'background',
  });

  const stateLink = withClientState({
    cache,
  });

  const authLink = setContext(async (req, { headers }) => {
    const token = await getToken();

    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : null,
      },
    };
  });

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

export default createClient(env.GRAPHQL_URL);
