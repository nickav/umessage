import React from 'react';
import { View } from 'react-native';

import styles from './Header.scss';

export default class Header extends React.Component {
  render() {
    return <View style={styles.Header} />;
  }
}
