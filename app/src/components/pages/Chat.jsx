import React from 'react';
import {
  Text,
  View,
  Button,
  FlatList,
  Image,
  TouchableWithoutFeedback,
  Linking,
  TouchableHighlight
} from 'react-native';
import { Query, Mutation } from 'react-apollo';
import Icon from 'react-native-vector-icons/MaterialIcons';

import styles from './Chat.scss';
import Header from '@/components/common/Header';
import TextInput from '@/components/common/TextInput';
import {
  CHAT_MESSAGES,
  SEND_MESSSAGE_TO_CHAT,
  handleNewMessage,
} from '@/store/chat';
import env from '@/helpers/env';
import {
  prettyTimeShort,
  prettyTime,
  getFakeId,
  isLargeText,
  createMessageBlocks,
} from '@/helpers/functions';

const hasText = (text) => {
  if (!text) return false;
  if (text.length === 1 && text.charCodeAt(0) === 65532) return false;
  return text.length > 0;
};

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
          <Icon name="call" size={24} color="#fff" />
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
      <View style={styles.Message}>
        {hasText(text) && (
          <Text
            style={[
              styles.text,
              is_from_me && styles.me,
              isLargeText(text) && styles.large,
            ]}
            selectable
          >
            {text}
          </Text>
        )}
        {attachments && (
          <Image
            style={{ width: 256, height: 340, borderRadius: 8 }}
            resizeMode="cover"
            source={{
              uri: `${env.API_URL}/attachments/${attachments[0].id}`,
            }}
          />
        )}
        {isExpanded && (
          <Text style={[styles.text, is_from_me && styles.me]}>
            {prettyTimeShort(date)}
          </Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );

  static TimeBlock = ({ time, date }) => (
    <View style={styles.TimeBlock}>
      <Text style={styles.text}>{prettyTime(time)}</Text>
    </View>
  );

  static MessageBlock = ({ messages, expanded, onPress }) => (
    <View style={styles.MessageBlock}>
      {messages.map((message) => (
        <Chat.Message
          key={message.id}
          {...message}
          isExpanded={!!expanded[message.id]}
          onPress={onPress(message.id)}
        />
      ))}
    </View>
  );

  static Block = ({ type, ...rest }) => {
    switch (type) {
      case 'messages':
        return <Chat.MessageBlock {...rest} />;
      case 'time':
        return <Chat.TimeBlock {...rest} />;
      default:
        return null;
    }
  };

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
                  data={createMessageBlocks(data.chat.messagePage.items)}
                  renderItem={({ item }) => (
                    <Chat.Block
                      {...item}
                      expanded={expanded}
                      onPress={this.toggleExpanded}
                    />
                  )}
                  keyExtractor={(item, index) => item.id.toString()}
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
                is_read: true,
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
