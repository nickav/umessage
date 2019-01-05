import React from 'react';
import { TextInput } from 'react-native';

export default class AutoTextInput extends React.Component {
  state = {
    height: 40,
  };

  updateSize = (height) => {
    this.setState({ height });
  };

  render() {
    const { props } = this;
    const { height } = this.state;

    const style = {
      height,
    };

    return (
      <TextInput
        editable
        multiline
        onContentSizeChange={(e) =>
          this.updateSize(e.nativeEvent.contentSize.height)
        }
        {...props}
        style={[style, props.style]}
      />
    );
  }
}
