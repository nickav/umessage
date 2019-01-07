import React from 'react';
import { View, PixelRatio, StatusBar } from 'react-native';

import styles from './Header.scss';

export default class Header extends React.Component {
  render() {
    return (
      <View style={styles.Header}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
      </View>
    );
  }
}
