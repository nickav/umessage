import { PubSub, withFilter } from 'graphql-subscriptions';
import { groupWithComputedProps } from './Group';

/* */
// Constants
const pubsub = new PubSub();

const MESSAGE_ADDED_TOPIC = 'messageAdded';
const CHAT_ADDED_TOPIC = 'chatAdded';

/* */
// Helpers
const getArrayIds = (usersOrIds) =>
  usersOrIds.map((user) => (typeof user === 'number' ? user : user.id));

const notifyUserIdsFilter = (payload, args, ctx) => {
  const userId = ctx.user.id;
  return Boolean(userId && payload.notifyUserIds.indexOf(userId) >= 0);
};

/* */
// Subscriptions
export const onMessageAdded = (message) => {
  pubsub.publish(MESSAGE_ADDED_TOPIC, {
    [MESSAGE_ADDED_TOPIC]: message,
  });

  return message;
};

export const onChatAdded = (group, users) => {
  pubsub.publish(CHAT_ADDED_TOPIC, {
    [CHAT_ADDED_TOPIC]: group,
    notifyUserIds: getArrayIds(users),
    users,
  });

  return group;
};

export default {
  messageAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(MESSAGE_ADDED_TOPIC),
      (payload, args, ctx) => {
        const { groupId, userId } = payload.messageAdded;

        return ctx.loaders.groupUsers
          .load(groupId)
          .then((users) => users.some((user) => user.id === userId));
      }
    ),
  },

  groupAdded: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(CHAT_ADDED_TOPIC),
      notifyUserIdsFilter
    ),
    resolve: (payload, args, context, info) =>
      groupWithComputedProps(payload.groupAdded, payload.users, context),
  },
};
