import React from 'react';
import { View, PixelRatio } from 'react-native';

import styles from './Header.scss';

export default class Header extends React.Component {
  render() {
    return (
      <View style={styles.Header}>
        {/*<View
          style={{ height: Constants.statusBarHeight * PixelRatio.get() }}
        />*/}
      </View>
    );
  }
}
