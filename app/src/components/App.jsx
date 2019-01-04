import React from 'react';
import { Text, View } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
//import { ApolloProvider } from 'react-apollo';
//import client from '@/store/client';

import * as pages from '@/components/pages';

import styles from './App.scss';

const App = createAppContainer(
  createStackNavigator(
    {
      Home: { screen: pages.Home },
      Chat: { screen: pages.Chat },
    },
    {
      defaultNavigationOptions: {
        headerStyle: styles.Header,
        headerTitleStyle: styles.Title,
      },
      headerMode: 'none',
    }
  )
);

class AppContainer extends React.Component {
  render() {
    return <App />;
  }
}

export default AppContainer;
