import React from 'react';
import {
  Text,
  View,
  Button,
  TouchableNativeFeedback,
  AsyncStorage,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Query } from 'react-apollo';
import {
  RecyclerListView,
  DataProvider,
  LayoutProvider,
} from 'recyclerlistview';

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

    const { width } = Dimensions.get('window');

    this._layoutProvider = new LayoutProvider(
      (index) => 0,
      (type, dim) => {
        dim.width = width;
        dim.height = 64;
      }
    );

    // check if unauthenticated
    getToken().then((token) => {
      if (!token) {
        navigation.replace('Login');
      }
    });

    // restore contacts from AsyncStorage
    AsyncStorage.getItem('contacts').then((contacts) => {
      if (contacts && !this.state.contactsByPhone) {
        const contactsByPhone = getContactsByPhone(JSON.parse(contacts));
        this.setState({ contactsByPhone });
      }
    });

    // load new contacts
    getContacts().then((contacts) => {
      if (!contacts) return;

      AsyncStorage.setItem('contacts', JSON.stringify(contacts));

      const contactsByPhone = getContactsByPhone(contacts);
      this.setState({ contactsByPhone });
    });
  }

  renderItem = (type, item) => {
    const { navigate } = this.props.navigation;
    const { contactsByPhone } = this.state;
    const display_name = getDisplayName(item, contactsByPhone);

    return (
      <Home.Chat
        {...item}
        display_name={display_name}
        onPress={() => navigate('Chat', { item: { ...item, display_name } })}
      />
    );
  };

  render() {
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

            const chats = (data.chats || [])
              .map((chat) => ({
                ...chat,
                sort: new Date(chat.messagePage.items[0].date).getTime(),
              }))
              .sort((a, b) => b.sort - a.sort);

            const dataProvider = new DataProvider((r1, r2) => r1.id !== r2.id);
            dataProvider.rowHasChanged = (prev, curr) =>
              prev.sort !== curr.sort;

            return (
              <RecyclerListView
                refreshControl={
                  <RefreshControl
                    refreshing={data.networkStatus === 4}
                    onRefresh={() => refetch()}
                  />
                }
                layoutProvider={this._layoutProvider}
                dataProvider={dataProvider.cloneWithRows(chats)}
                rowRenderer={this.renderItem}
              />
            );
          }}
        </Query>
      </View>
    );
  }
}
