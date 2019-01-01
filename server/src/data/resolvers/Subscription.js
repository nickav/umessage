import { PubSub, withFilter } from 'graphql-subscriptions';
import { groupWithComputedProps } from './Group';

/* */
// Constants
const pubsub = new PubSub();

const MESSAGE_ADDED_TOPIC = 'messageAdded';
const GROUP_ADDED_TOPIC = 'groupAdded';
const GROUP_REMOVED_TOPIC = 'groupRemoved';

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

export const onGroupAdded = (group, users) => {
  pubsub.publish(GROUP_ADDED_TOPIC, {
    [GROUP_ADDED_TOPIC]: group,
    notifyUserIds: getArrayIds(users),
    users,
  });

  return group;
};

export const onGroupRemoved = (group, users) => {
  pubsub.publish(GROUP_REMOVED_TOPIC, {
    [GROUP_REMOVED_TOPIC]: group,
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
      () => pubsub.asyncIterator(GROUP_ADDED_TOPIC),
      notifyUserIdsFilter
    ),
    resolve: (payload, args, context, info) =>
      groupWithComputedProps(payload.groupAdded, payload.users, context),
  },

  groupRemoved: {
    subscribe: withFilter(
      () => pubsub.asyncIterator(GROUP_REMOVED_TOPIC),
      notifyUserIdsFilter
    ),
  },
};
