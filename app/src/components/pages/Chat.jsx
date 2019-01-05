import React from 'react';
import {
  Text,
  View,
  Button,
  FlatList,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { Query, Mutation } from 'react-apollo';

import styles from './Chat.scss';
import Header from '@/components/common/Header';
import TextInput from '@/components/common/TextInput';
import { CHAT_MESSAGES, SEND_MESSSAGE } from '@/store/chat';

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

  state = {
    text: '',
  };

  render() {
    const { state, goBack } = this.props.navigation;

    const { text } = this.state;

    const { id, handles } = state.params.item;

    return (
      <View style={styles.Chat}>
        <Header />

        <KeyboardAvoidingView behavior="padding" enabled>
          <Query query={CHAT_MESSAGES} variables={{ id }}>
            {({ loading, error, data, refetch }) =>
              data.chat ? (
                <FlatList
                  inverted
                  refreshing={data.networkStatus === 4}
                  onRefresh={() => refetch()}
                  data={data.chat.messagePage.items}
                  renderItem={({ item }) => <Chat.Message {...item} />}
                  keyExtractor={(item, i) => item.id.toString()}
                />
              ) : (
                <Text>Loading...</Text>
              )
            }
          </Query>

          <Mutation mutation={SEND_MESSSAGE}>
            {(sendMessage) => (
              <View style={styles.Composer}>
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => this.setState({ text })}
                  value={text}
                  multiline
                />
                <Button
                  title="Send"
                  onPress={() => {
                    if (!text.trim().length) {
                      return;
                    }

                    sendMessage({
                      variables: {
                        handleGuids: handles.map((e) => e.guid),
                        text,
                      },
                    });

                    this.setState({ text: '' });
                  }}
                />
              </View>
            )}
          </Mutation>
        </KeyboardAvoidingView>
      </View>
    );
  }
}
