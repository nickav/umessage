import { toSortCursor, fromSortCursor, fromAppleTime } from './helpers';

export default {
  messagePage: (chat, args, ctx) => {
    const { db } = ctx;
    const { page } = args;

    if (page.size === 1 && !page.cursor) {
      return ctx.loaders.lastMessage.load(chat.id).then((message) => ({
        cursor: toSortCursor(message),
        items: [message].filter((e) => e),
      }));
    }

    return db
      .all(
        `
        SELECT ${db.getMessageProps()} from message
        JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
        WHERE chat_message_join.chat_id = ${chat.id}
        ${page.cursor ? 'AND ROWID < ' + fromSortCursor(page.cursor) : ''}
        ORDER BY date DESC
        LIMIT ${page.size || 20};
        `
      )
      .then((messages) => ({
        cursor: toSortCursor(messages[messages.length - 1]),
        items: messages
          .map((message) => ({
            ...message,
            date: fromAppleTime(message.date),
          }))
          .sort((a, b) => b.id - a.id),
      }));
  },

  handles: (chat, args, ctx) => {
    return ctx.loaders.chatHandles.load(chat.id);
  },
};
