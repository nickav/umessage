import React from 'react';
import { AppState } from 'react-native';
import {
  createStackNavigator,
  createAppContainer,
  addNavigationHelpers,
} from 'react-navigation';
import { ApolloProvider } from 'react-apollo';

import client from '@/store/client';
import * as subscriptions from '@/store/subs';
import * as pages from '@/components/pages';

import styles from './App.scss';

const routes = {
  Home: { screen: pages.Home },
  Chat: { screen: pages.Chat },
  Login: { screen: pages.Login },
};

const Navigator = createStackNavigator(routes, {
  defaultNavigationOptions: {
    headerStyle: styles.Header,
    headerTitleStyle: styles.Title,
    headerTintColor: '#fff',
  },
  cardStyle: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

const AppContainer = createAppContainer(Navigator);

class App extends React.Component {
  componentWillMount() {
    AppState.addEventListener('change', this.onAppStateChange);
  }

  onAppStateChange = (appState) => {
    if (this.subs) subscriptions.unsubscribe(this.subs);
    this.subs = subscriptions.subscribe(client);

    console.log('onAppStateChange', appState);
  };

  componentWillUnmount() {
    AppState.removeEventListener('change', this.onAppStateChange);
  }

  render() {
    const { props } = this;

    return (
      <ApolloProvider client={client}>
        <AppContainer />
      </ApolloProvider>
    );
  }
}

export default App;
