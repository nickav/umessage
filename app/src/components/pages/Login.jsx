import React from 'react';
import { TextInput, View, Button } from 'react-native';
import { Mutation } from 'react-apollo';

import Header from '@/components/common/Header';
import { setAuth, getToken } from '@/store/auth';
import { LOGIN } from '@/store/user';

import styles from './Login.scss';

export default class Login extends React.Component {
  static navigationOptions = {
    title: 'Login',
  };

  state = {
    email: '',
    password: '',
  };

  render() {
    const { navigation } = this.props;
    const { email, password } = this.state;

    return (
      <View style={styles.Login}>
        <Header />

        <Mutation mutation={LOGIN}>
          {(login) => (
            <View>
              <TextInput
                onChangeText={(email) => this.setState({ email })}
                value={email}
                keyboardType="email-address"
                textContentType="emailAddress"
                style={styles.text}
                placeholder="Email"
                placeholderTextColor="#888"
              />
              <TextInput
                onChangeText={(password) => this.setState({ password })}
                textContentType="password"
                value={password}
                secureTextEntry
                style={styles.text}
                placeholder="Password"
                placeholderTextColor="#888"
              />
              <Button
                title="Login"
                disabled={!email.length || !password.length}
                onPress={() => {
                  login({ variables: { email, password } }).then((result) => {
                    setAuth(email, result.data.auth).then(() =>
                      navigation.replace('Home')
                    );
                  });
                }}
              />
            </View>
          )}
        </Mutation>
      </View>
    );
  }
}
