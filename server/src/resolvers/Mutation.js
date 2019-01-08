import { sendMessage } from '../imessage';
import { auth } from '../auth';
import { fromAppleTime } from './helpers';

export default {
  auth: (_, args, ctx) => auth(ctx, args),

  sendMessage: (_, { handleGuids, text }, ctx) => {
    const { db } = ctx;
    const sanitizedText = text.trim();

    return sendMessage(handleGuids, sanitizedText)
      .then(() =>
        db
          .get(
            `SELECT ${db.getMessageProps()} FROM message WHERE ROWID = (SELECT MAX(ROWID) as id from message);`
          )
          .then((message) => ({
            ...message,
            date: fromAppleTime(message.date),
          }))
      )
      .catch((err) => {
        console.error(err);
        return null;
      });
  },
};
