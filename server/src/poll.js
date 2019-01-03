import { onMessageAdded } from './resolvers/Subscription';
import { transformMessage } from './resolvers/helpers';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getMessageCount(db) {
  const result = await db.get(`SELECT count(*) as count FROM message;`);
  return result.count;
}

async function getLastNMessages(db, n = 1) {
  const messages = await db
    .all(
      `
      SELECT ${db.getMessageProps()} from message
      ORDER BY date DESC
      LIMIT ${n};
    `
    )
    .then((messages) => messages.map(transformMessage));
  return messages;
}

async function pollMessages(db, pollInterval, cb) {
  let lastMessageCount = await getMessageCount(db);

  while (true) {
    const messageCount = await getMessageCount(db);

    if (lastMessageCount !== messageCount) {
      const numRecieved = messageCount - lastMessageCount;
      const newMessages = await getLastNMessages(db, numRecieved);

      cb(newMessages);

      lastMessageCount = messageCount;
    }

    await sleep(pollInterval);
  }
}

export default (ctx) => {
  const POLL_INTERVAL = 400;

  pollMessages(ctx.db, POLL_INTERVAL, (messages) => {
    console.log(`Recieved ${messages.length} message(s).`);

    for (let i = messages.length - 1; i >= 0; i--) {
      onMessageAdded(messages[i]);
    }
  });
};
