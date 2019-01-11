import React from 'react';
import { AppState } from 'react-native';
import {
  createStackNavigator,
  createAppContainer,
  NavigationActions,
} from 'react-navigation';
import { ApolloProvider } from 'react-apollo';

import client from '@/store/client';
import * as subscriptions from '@/store/subs';
import * as notifications from '@/store/notifications';
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
    notifications.init().then((token) => console.log('fcmToken', token));

    this.notificationListeners = notifications.createListeners({
      onOpen: (notification) => {
        console.log('onOpen', notification);
        /*
        this.navigator.dispatch(
          NavigationActions.navigate({ routeName: 'Chat', params: { } })
        );
        */
      },
    });
  }

  onAppStateChange = (appState) => {
    if (this.subs) subscriptions.unsubscribe(this.subs);
    this.subs = subscriptions.subscribe(client);

    console.log('onAppStateChange', appState);
  };

  componentWillUnmount() {
    AppState.removeEventListener('change', this.onAppStateChange);
    this.notificationListeners.forEach((unsubscribe) => unsubscribe());
  }

  render() {
    const { props } = this;

    return (
      <ApolloProvider client={client}>
        <AppContainer
          ref={(nav) => {
            this.navigator = nav;
          }}
        />
      </ApolloProvider>
    );
  }
}

export default App;
