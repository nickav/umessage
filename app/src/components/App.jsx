import React from 'react';
import {
  createStackNavigator,
  createAppContainer,
  addNavigationHelpers,
} from 'react-navigation';
import { ApolloProvider } from 'react-apollo';
import { Contacts, Permissions } from 'expo';
import client from '@/store/client';

/*
Permissions.askAsync(Expo.Permissions.CONTACTS).then(() =>
  Contacts.getContactsAsync({ pageSize: 0 }).then(console.log)
);
*/

import * as pages from '@/components/pages';

import styles from './App.scss';

const routes = {
  Home: { screen: pages.Home },
  Chat: { screen: pages.Chat },
};

const Navigator = createStackNavigator(routes, {
  defaultNavigationOptions: {
    headerStyle: styles.Header,
    headerTitleStyle: styles.Title,
    headerTintColor: '#fff',
  },
  //headerMode: 'none',
});

const AppContainer = createAppContainer(Navigator);

class App extends React.Component {
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
