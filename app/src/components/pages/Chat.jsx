import React from 'react';
import { Text, View, FlatList, Image } from 'react-native';
import { Query } from 'react-apollo';

import styles from './Chat.scss';
import Header from '@/components/common/Header';
import { CHAT_MESSAGES } from '@/store/chat';

export default class Chat extends React.Component {
  static navigationOptions = {
    title: 'Chat',
  };

  static Message = ({ id, text, date, is_from_me, attachments }) => (
    <View style={[styles.Message]}>
      <Text style={[styles.text, is_from_me && styles.me]}>{text}</Text>
      {attachments && (
        <Image
          style={{ width: 64, height: 64 }}
          source={{
            uri: `http://192.168.0.164:3001/attachments/${attachments[0].id}`,
          }}
        />
      )}
    </View>
  );

  render() {
    const { state, goBack } = this.props.navigation;

    const { id } = state.params.item;

    return (
      <View style={styles.Chat}>
        <Header />

        <Query query={CHAT_MESSAGES} variables={{ id }}>
          {({ loading, error, data }) =>
            data.chat ? (
              <FlatList
                inverted
                data={data.chat.messagePage.items}
                renderItem={({ item }) => <Chat.Message {...item} />}
                keyExtractor={(item, i) => item.id.toString()}
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
