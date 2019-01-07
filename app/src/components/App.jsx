import React from 'react';
import { PermissionsAndroid } from 'react-native';
import {
  createStackNavigator,
  createAppContainer,
  addNavigationHelpers,
} from 'react-navigation';
import { ApolloProvider } from 'react-apollo';
import Contacts from 'react-native-contacts';

import client from '@/store/client';
import * as pages from '@/components/pages';

import styles from './App.scss';

/*
PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS).then(
  (enabled) => {
    Contacts.getAll((err, contacts) => {
      if (err) {
        console.error(err);
        return;
      }

      phoneNumbers[].number, givenName, middleName, familyName
      console.log(contacts);
    });
  }
);
*/

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
