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
import { getToken } from '@/store/auth';
import {
  getContacts,
  getContactsByPhone,
  getDisplayName,
} from '@/store/contacts';

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

  state = {
    contactsByPhone: {},
  };

  componentWillMount() {
    const { navigation } = this.props;

    getToken().then((token) => {
      if (!token) {
        navigation.replace('Login');
      }
    });

    getContacts().then((contacts) => {
      const contactsByPhone = getContactsByPhone(contacts);
      console.log(contactsByPhone);
      this.setState({ contactsByPhone });
    });
  }

  render() {
    const { navigate } = this.props.navigation;
    const { contactsByPhone } = this.state;

    return (
      <View style={styles.Home}>
        <Header />

        <Query query={CHAT_FEED}>
          {({ loading, error, data, refetch }) => {
            if (loading) {
              return <Text style={styles.text}>Loading...</Text>;
            }

            if (error) {
              return <Text style={styles.text}>Something went wrong.</Text>;
            }

            return (
              <FlatList
                data={data.chats
                  .map((chat) => ({
                    ...chat,
                    sort: new Date(chat.messagePage.items[0].date).getTime(),
                  }))
                  .sort((a, b) => b.sort - a.sort)}
                refreshing={data.networkStatus === 4}
                onRefresh={() => refetch()}
                renderItem={({ item }) => (
                  <Home.Chat
                    {...item}
                    display_name={getDisplayName(item, contactsByPhone)}
                    onPress={() =>
                      navigate('Chat', {
                        item: {
                          ...item,
                          display_name: getDisplayName(item, contactsByPhone),
                        },
                      })
                    }
                  />
                )}
                keyExtractor={(item, i) => item.guid}
              />
            );
          }}
        </Query>
      </View>
    );
  }
}
