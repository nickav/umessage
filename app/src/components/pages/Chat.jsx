import React from 'react';
import { Text, View, FlatList } from 'react-native';
import { Query } from 'react-apollo';

import styles from './Chat.scss';
import Header from '@/components/common/Header';
import { GET_CHAT } from '@/store/chat';

export default class Chat extends React.Component {
  static navigationOptions = {
    title: 'Chat',
  };

  static Message = ({ id, text, date, is_from_me }) => (
    <View style={styles.Message}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );

  render() {
    const { state, goBack } = this.props.navigation;

    const { id } = state.params.item;

    return (
      <View style={styles.Chat}>
        <Header />

        <Query query={GET_CHAT} variables={{ id }}>
          {({ loading, error, data }) =>
            data.chat ? (
              <FlatList
                inverted
                data={data.chat.messagePage.items}
                renderItem={({ item }) => <Chat.Message {...item} />}
                keyExtractor={(item, i) => item.id}
              />
            ) : (
              <Text>Loading...</Text>
            )
          }
        </Query>
      </View>
    );
  }
}
