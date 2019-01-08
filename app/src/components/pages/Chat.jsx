import React from 'react';
import {
  Text,
  View,
  Button,
  FlatList,
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import { Query, Mutation } from 'react-apollo';
import { Linking, TouchableHighlight } from 'react-native';

import styles from './Chat.scss';
import Header from '@/components/common/Header';
import TextInput from '@/components/common/TextInput';
import { CHAT_MESSAGES, SEND_MESSSAGE } from '@/store/chat';
import { BASE_URL } from '@/helpers/env';
import { prettyTimeShort, prettyTime, getFakeId } from '@/helpers/functions';

export default class Chat extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { handles, display_name } = navigation.state.params.item || {};
    return {
      title: display_name || handles.map((e) => e.guid).join(', '),
      headerRight: (
        <TouchableHighlight
          onPress={() => Linking.openURL(`tel:${handles[0].guid}`)}
          style={styles.Icon}
        >
          <Image
            source={require('./call.png')}
            style={{ width: 24, height: 24 }}
          />
        </TouchableHighlight>
      ),
    };
  };

  static Message = ({
    id,
    text,
    date,
    is_from_me,
    attachments,
    onPress,
    isExpanded,
  }) => (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={[styles.Message]}>
        <Text style={[styles.text, is_from_me && styles.me]}>{text}</Text>
        {isExpanded && (
          <Text style={[styles.text, is_from_me && styles.me]}>
            {prettyTimeShort(date)}
          </Text>
        )}
        {attachments && (
          <Image
            style={{ width: 64, height: 64 }}
            source={{
              uri: `http://${BASE_URL}/attachments/${attachments[0].id}`,
            }}
          />
        )}
      </View>
    </TouchableWithoutFeedback>
  );

  state = {
    text: '',
    expanded: {},
  };

  toggleExpanded = (id) => () => {
    const { expanded } = this.state;
    this.setState({
      expanded: {
        ...expanded,
        [id]: !expanded[id],
      },
    });
  };

  render() {
    const { state } = this.props.navigation;

    const { text, expanded } = this.state;

    const { id, handles } = state.params.item;

    return (
      <View style={styles.Chat}>
        <Header />

        <View style={styles.Messages}>
          <Query query={CHAT_MESSAGES} variables={{ id, page: { size: 30 } }}>
            {({ loading, error, data, refetch }) =>
              data.chat ? (
                <FlatList
                  inverted
                  refreshing={data.networkStatus === 4}
                  onRefresh={() => refetch()}
                  onViewableItemsChanged={undefined}
                  data={data.chat.messagePage.items.sort((a, b) => b.id - a.id)}
                  renderItem={({ item }) => (
                    <Chat.Message
                      {...item}
                      isExpanded={!!expanded[item.id]}
                      onPress={this.toggleExpanded(item.id)}
                    />
                  )}
                  keyExtractor={(item, i) => item.id.toString()}
                />
              ) : (
                <Text>Loading...</Text>
              )
            }
          </Query>

          <Mutation
            mutation={SEND_MESSSAGE}
            optimisticResponse={{
              sendMessage: {
                __typename: 'Message',
                id: getFakeId(),
                text,
                date: new Date().toISOString(),
                is_from_me: true,
                attachments: null,
              },
            }}
            update={(cache, { data: { sendMessage } }) => {
              cache.readWriteQuery({
                query: CHAT_MESSAGES,
                variables: { id, page: { size: 30 } },
                data: (data) => {
                  data.chat.messagePage.items = data.chat.messagePage.items.filter(
                    (e) => e.id > 0
                  );
                  data.chat.messagePage.items.unshift(sendMessage);
                },
              });
            }}
          >
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
        </View>
      </View>
    );
  }
}
