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
  componentDidMount() {
    const { setToken } = this.props;

    AppState.addEventListener('change', this.onAppStateChange);

    notifications
      .init()
      .then((token) => {
        console.log('setToken', token);
        setToken(token);
      })
      .then(() => this.createListeners());
  }

  createListeners = () => {
    this.notificationListeners = notifications.createListeners({
      onOpen: (notification) => {
        console.log('onOpen', notification);

        const chatId = parseInt(notification.data.chat_id, 10);

        this.navigator.dispatch(
          NavigationActions.navigate({
            routeName: 'Chat',
            params: {
              chat: {
                id: chatId,
                display_name: `Chat ${chatId}`,
                handles: [],
              },
            },
          })
        );
      },
      onNotification: (notification, appVisibility) => {
        if (appVisibility === 'foreground') {
          const { routeName, params } = this.getActiveRoute(
            this.navigator.state.nav
          );

          const chatId = parseInt(notification.data.chat_id, 10);
          console.log('Notification', routeName, params, chatId);
          return routeName !== 'Chat' || params.chat.id !== chatId;
        }
      },
    });
  };

  onAppStateChange = (appState) => {
    if (this.subs) subscriptions.unsubscribe(this.subs);
    this.subs = subscriptions.subscribe(client);

    console.log('onAppStateChange', appState);
  };

  getActiveRoute = (navigationState) => {
    if (!navigationState) {
      return null;
    }

    const route = navigationState.routes[navigationState.index];
    // dive into nested navigators
    if (route.routes) {
      return this.getActiveRoute(route);
    }

    return route;
  };

  componentWillUnmount() {
    AppState.removeEventListener('change', this.onAppStateChange);

    if (this.notificationListeners) {
      this.notificationListeners.forEach((unsubscribe) => unsubscribe());
      this.notificationListeners = null;
    }
  }

  render() {
    const { props } = this;

    return (
      <AppContainer
        ref={(nav) => {
          this.navigator = nav;
        }}
      />
    );
  }
}

const EnhancedApp = notifications.setTokenMutation(App);

export default () => (
  <ApolloProvider client={client}>
    <EnhancedApp />
  </ApolloProvider>
);
