import React from 'react';
import { Text, View } from 'react-native';

import styles from './App.scss';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Hello, guy!</Text>
      </View>
    );
  }
}
