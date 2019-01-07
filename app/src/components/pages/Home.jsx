import React from 'react';
import {
  Text,
  View,
  Button,
  FlatList,
  TouchableNativeFeedback,
} from 'react-native';
import { Query } from 'react-apollo';

import Header from '@/components/common/Header';
import { CHAT_FEED } from '@/store/chat';

import styles from './Home.scss';

export default class Home extends React.Component {
  static navigationOptions = {
    title: 'Messages',
  };

  static Chat = ({ id, display_name, messagePage, onPress }) => (
    <View style={styles.Chat}>
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple(
          'rgba(255,255,255,.2)',
          true
        )}
      >
        <View style={styles.inner}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {display_name}
          </Text>
          <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
            {messagePage.items[0].text}
          </Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );

  render() {
    const { navigate } = this.props.navigation;

    return (
      <View style={styles.Home}>
        <Header />

        <Query query={CHAT_FEED}>
          {({ loading, error, data }) => (
            <FlatList
              data={data.chats}
              renderItem={({ item }) => (
                <Home.Chat
                  {...item}
                  display_name={
                    item.display_name ||
                    item.handles.map((e) => e.guid).join(', ')
                  }
                  onPress={() => navigate('Chat', { item })}
                />
              )}
              keyExtractor={(item, i) => item.guid}
            />
          )}
        </Query>
      </View>
    );
  }
}
