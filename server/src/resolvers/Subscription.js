import { PubSub } from 'graphql-subscriptions';

/* */
// Constants
const pubsub = new PubSub();

const MESSAGE_ADDED_TOPIC = 'messageAdded';

/* */
// Subscriptions
export const onMessageAdded = (message) => {
  pubsub.publish(MESSAGE_ADDED_TOPIC, {
    [MESSAGE_ADDED_TOPIC]: message,
  });

  console.log('onMessageAdded', message);

  return message;
};

export default {
  messageAdded: {
    subscribe: () => pubsub.asyncIterator(MESSAGE_ADDED_TOPIC),
  },
};
