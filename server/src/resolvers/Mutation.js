import * as imessage from '../imessage';
import { auth } from '../auth';
import { fromAppleTime } from './helpers';
import { setToken } from '../token';

const getLastMessage = (ctx) =>
  ctx.db
    .get(
      `
      SELECT ${ctx.db.getMessageProps()} FROM message
      WHERE ROWID = (SELECT MAX(ROWID) as id from message);
      `
    )
    .then((message) => ({
      ...message,
      date: fromAppleTime(message.date),
    }));

const sendMessage = (_, { handleGuids, text }, ctx) =>
  imessage
    .sendMessage(handleGuids, text)
    .then(() => getLastMessage(ctx))
    .catch((err) => {
      console.error(err);
      return null;
    });

export default {
  auth: (_, args, ctx) => auth(ctx, args),

  setToken: (_, { token }, ctx) => {
    return setToken(token)
      .then(() => true)
      .catch(() => false);
  },

  sendMessage,

  sendMessageToChat: (_, { chatId, text }, ctx) =>
    ctx.loaders.chatHandles.load(chatId).then((handles) => {
      if (!handles) {
        return ctx.throw(400, 'Invalid chatId.');
      }

      const handleGuids = handles.map((e) => e.guid);
      return sendMessage(_, { handleGuids, text }, ctx);
    }),

  markRead: (_, { chatId, afterMessageId }, ctx) =>
    ctx.db
      .run(
        `
        UPDATE message SET is_read = 1
        JOIN chat_message_join ON chat_message_join.message_id = message.ROWID
        WHERE chat_id = ${chatId}
        AND ROWID >= ${afterMessageId};
        `
      )
      .then(() => true)
      .catch((err) => {
        console.log(err);
        return false;
      }),
};
