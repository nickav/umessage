import React from 'react';
import {
  Text,
  View,
  Button,
  FlatList,
  TouchableNativeFeedback,
  AsyncStorage,
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
import { prettyTimeTiny } from '@/helpers/functions';

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
          <View style={styles.left}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {display_name}
            </Text>
            <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
              {messagePage.items[0].text}
            </Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.text} numberOfLines={1}>
              {prettyTimeTiny(messagePage.items[0].date)}
            </Text>
          </View>
        </View>
      </TouchableNativeFeedback>
    </View>
  );

  state = {
    contactsByPhone: {},
  };

  componentWillMount() {
    const { navigation } = this.props;

    // check if unauthenticated
    getToken().then((token) => {
      if (!token) {
        navigation.replace('Login');
      }
    });

    // restore contacts from AsyncStorage
    /*
    AsyncStorage.getItem('contacts').then((contacts) => {
      if (contacts && !this.state.contactsByPhone) {
        const contactsByPhone = getContactsByPhone(JSON.parse(contacts));
        this.setState({ contactsByPhone });
      }
    });
    */

    // load new contacts
    getContacts().then((contacts) => {
      if (!contacts) return;

      //AsyncStorage.setItem('contacts', JSON.stringify(contacts));

      const contactsByPhone = getContactsByPhone(contacts);
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
                keyExtractor={(item, i) => item.id.toString()}
              />
            );
          }}
        </Query>
      </View>
    );
  }
}
