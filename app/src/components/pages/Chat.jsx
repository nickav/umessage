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
import { Linking, TouchableHighlight } from 'react-native';

import styles from './Chat.scss';
import Header from '@/components/common/Header';
import TextInput from '@/components/common/TextInput';
import { CHAT_MESSAGES, SEND_MESSSAGE } from '@/store/chat';
import { BASE_URL } from '@/helpers/env';

export default class Chat extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { handles, display_name } = navigation.state.params.item || {};
    return {
      title: display_name || handles.map((e) => e.guid).join(', '),
      headerRight: (
        <TouchableHighlight
          onPress={() => Linking.openURL(`tel:${handles[0].guid}`)}
        >
          <Image
            source={require('./call.png')}
            style={{ width: 24, height: 24 }}
          />
        </TouchableHighlight>
      ),
    };
  };

  static Message = ({ id, text, date, is_from_me, attachments }) => (
    <View style={[styles.Message]}>
      <Text style={[styles.text, is_from_me && styles.me]}>{text}</Text>
      {attachments && (
        <Image
          style={{ width: 64, height: 64 }}
          source={{
            uri: `http://${BASE_URL}/attachments/${attachments[0].id}`,
          }}
        />
      )}
    </View>
  );

  state = {
    text: '',
  };

  render() {
    const { state } = this.props.navigation;

    const { text } = this.state;

    const { id, handles } = state.params.item;

    return (
      <View style={styles.Chat}>
        <Header />

        <KeyboardAvoidingView
          style={styles.Messages}
          behavior="padding"
          enabled
        >
          <Query query={CHAT_MESSAGES} variables={{ id, page: { size: 30 } }}>
            {({ loading, error, data, refetch }) =>
              data.chat ? (
                <FlatList
                  inverted
                  refreshing={data.networkStatus === 4}
                  onRefresh={() => refetch()}
                  onViewableItemsChanged={console.log}
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
