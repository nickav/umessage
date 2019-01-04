import React from 'react';
import { Text, View, Button } from 'react-native';

import styles from './Chat.scss';

export default class Chat extends React.Component {
  static navigationOptions = {
    title: 'Chat',
  };

  render() {
    const { goBack } = this.props.navigation;
    return (
      <View style={styles.Chat}>
        <Text>Hello, Chat!</Text>
        <Button title="Back" onPress={() => goBack()} />
      </View>
    );
  }
}

