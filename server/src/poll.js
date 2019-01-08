import { onMessageAdded } from './resolvers/Subscription';
import { transformMessage } from './resolvers/helpers';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getMessageCount = async (db) => {
  const result = await db.get(`SELECT count(*) as count FROM message;`);
  return result.count;
};

const getLastNMessages = async (db, n = 1) =>
  await db
    .all(
      `
      SELECT ${db.getMessageProps()} from message
      ORDER BY date DESC
      LIMIT ${n};
    `
    )
    .then((messages) => messages.map(transformMessage));

const pollMessages = async (db, pollInterval, cb) => {
  let lastMessageCount = await getMessageCount(db);
  let isCancel = false;

  while (true) {
    if (isCancel) return;

    const messageCount = await getMessageCount(db);

    if (lastMessageCount !== messageCount) {
      const numRecieved = messageCount - lastMessageCount;
      const newMessages = await getLastNMessages(db, numRecieved);

      cb(newMessages);

      lastMessageCount = messageCount;
    }

    await sleep(pollInterval);
  }

  return () => (isCancel = true);
};

const defaultOptions = { interval: 500 };

export default (ctx, options) => {
  const config = { ...defaultOptions, ...options };

  const cancel = pollMessages(ctx.db, config.interval, (messages) => {
    console.log(`Recieved ${messages.length} message(s).`);

    for (let i = messages.length - 1; i >= 0; i--) {
      onMessageAdded(messages[i]);
    }
  });

  return { cancel };
};
