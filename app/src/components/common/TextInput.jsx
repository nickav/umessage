import React from 'react';
import { TextInput } from 'react-native';

export default class AutoTextInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      height: (props.style || {}).height
    };
  }

  updateSize = (height) => {
    this.setState({ height });
  };

  render() {
    const { props } = this;
    const { height } = this.state;

    return (
      <TextInput
        editable
        multiline
        onContentSizeChange={(e) =>
          this.updateSize(e.nativeEvent.contentSize.height)
        }
        {...props}
        style={[{ height }, props.style]}
      />
    );
  }
}
