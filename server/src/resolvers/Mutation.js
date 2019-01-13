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

const sendMessage = (_, { handleGuids, text }, ctx) => {
  const { db } = ctx;
  const sanitizedText = text.trim();

  return imessage
    .sendMessage(handleGuids, sanitizedText)
    .then(() => getLastMessage(ctx))
    .catch((err) => {
      console.error(err);
      return null;
    });
};

export default {
  auth: (_, args, ctx) => auth(ctx, args),

  sendMessage,

  sendMessageToChat: (_, { chatId, text }, ctx) =>
    ctx.loaders.chatHandles.load(chatId).then((handles) => {
      const handleGuids = handles.map((e) => e.guid);
      return sendMessage(_, { handleGuids, text }, ctx);
    }),

  setToken: (_, { token }, ctx) => {
    return setToken(token)
      .then(() => true)
      .catch(() => false);
  },
};
