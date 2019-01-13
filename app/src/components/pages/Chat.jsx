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
import {
  CHAT_MESSAGES,
  SEND_MESSSAGE_TO_CHAT,
  handleNewMessage,
} from '@/store/chat';
import { API_URL } from '@/helpers/env';
import { prettyTimeShort, prettyTime, getFakeId } from '@/helpers/functions';

export default class Chat extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { handles, display_name } = navigation.state.params.chat || {};
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
        <Text style={[styles.text, is_from_me && styles.me]} selectable>
          {text}
        </Text>
        {isExpanded && (
          <Text style={[styles.text, is_from_me && styles.me]}>
            {prettyTimeShort(date)}
          </Text>
        )}
        {attachments && (
          <Image
            style={{ width: 64, height: 64 }}
            source={{
              uri: `http://${API_URL}/attachments/${attachments[0].id}`,
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

  onScrollThreshold = (threshold) => (fn) => (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;

    const percent =
      Math.abs(
        contentOffset.y + layoutMeasurement.height - contentSize.height
      ) / layoutMeasurement.height;

    if (percent <= threshold) {
      fn();
    }
  };

  render() {
    const { state } = this.props.navigation;

    const { text, expanded } = this.state;

    const { id, handles } = state.params.chat;

    return (
      <View style={styles.Chat}>
        <Header />

        <View style={styles.Messages}>
          <Query
            query={CHAT_MESSAGES}
            skip={!id}
            variables={{ id, page: { size: 30 } }}
            notifyOnNetworkStatusChange
          >
            {({ loading, error, data, refetch, fetchMore }) =>
              data.chat ? (
                <FlatList
                  inverted
                  refreshing={data.networkStatus === 4}
                  onRefresh={() => refetch()}
                  onScroll={
                    loading
                      ? undefined
                      : this.onScrollThreshold(0.8)(() => {
                          const { cursor } = data.chat.messagePage;

                          if (!cursor) {
                            console.log('End reached.');
                            return;
                          }

                          fetchMore({
                            variables: { id, page: { size: 30, cursor } },
                            updateQuery: (prev, { fetchMoreResult }) => {
                              if (!fetchMoreResult) return prev;

                              console.log('fetchMore', cursor);

                              fetchMoreResult.chat.messagePage.items.unshift(
                                ...prev.chat.messagePage.items
                              );

                              return fetchMoreResult;
                            },
                          });
                        })
                  }
                  data={data.chat.messagePage.items}
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
            mutation={SEND_MESSSAGE_TO_CHAT}
            optimisticResponse={{
              sendMessageToChat: {
                __typename: 'Message',
                id: getFakeId(),
                text,
                date: new Date().toISOString(),
                is_from_me: true,
                attachments: null,
                handle_id: id,
              },
            }}
            update={(cache, { data: { sendMessageToChat } }) => {
              console.log('sendMessageToChat');
              handleNewMessage(cache, sendMessageToChat, id);
            }}
          >
            {(sendMessageToChat) => (
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

                    sendMessageToChat({
                      variables: { chatId: id, text },
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
