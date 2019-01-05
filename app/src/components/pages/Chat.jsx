import React from 'react';
import { Text, View, Button } from 'react-native';

import styles from './Chat.scss';
import Header from '@/components/common/Header';

export default class Chat extends React.Component {
  static navigationOptions = {
    title: 'Chat',
  };

  render() {
    const { goBack } = this.props.navigation;

    return (
      <View style={styles.Chat}>
        <Header />

        <Text>Hello, Chat!</Text>
        <Button title="Back" onPress={() => goBack()} />
      </View>
    );
  }
}

