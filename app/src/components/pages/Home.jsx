import React from 'react';
import { Text, View, Button, FlatList } from 'react-native';

import styles from './Home.scss';

export default class Home extends React.Component {
  static navigationOptions = {
    title: 'Messages',
  };

  render() {
    const { navigate } = this.props.navigation;

    return (
      <View style={styles.Home}>
        <Text style={styles.text}>Home Page, doggy!</Text>
        <Button title="Go to Chat" onPress={() => navigate('Chat')} />
        <FlatList
          data={[
            { key: 'Devin' },
            { key: 'Jackson' },
            { key: 'James' },
            { key: 'Joel' },
            { key: 'John' },
            { key: 'Jillian' },
            { key: 'Jimmy' },
            { key: 'Julie' },
          ]}
          renderItem={({ item }) => <Text style={styles.text}>{item.key}</Text>}
        />
      </View>
    );
  }
}
