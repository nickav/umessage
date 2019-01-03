import { toSortCursor, fromSortCursor, fromAppleTime } from './helpers';

export default {
  messagePage: (chat, args, ctx) => {
    const { page } = args;

    if (page.count === 1 && !page.cursor) {
      return ctx.loaders.lastMessage.load(chat.id).then((message) => ({
        cursor: toSortCursor(message),
        items: [message].filter((e) => e),
      }));
    }

    return ctx.db
      .all(
        `
        SELECT ROWID as id, guid, text, date, is_from_me,
          cache_has_attachments, handle_id, chat_message_join.chat_id,
          associated_message_guid
        FROM message
        JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
        WHERE chat_message_join.chat_id = ${chat.id}
        ${page.cursor ? 'AND ROWID < ' + fromSortCursor(page.cursor) : ''}
        ORDER BY date DESC
        LIMIT ${page.count || 20};
        `
      )
      .then((messages) => ({
        cursor: toSortCursor(messages[messages.length - 1]),
        items: messages.map((message) => ({
          ...message,
          date: fromAppleTime(message.date),
        })),
      }));
  },

  handles: (chat, args, ctx) => {
    return ctx.loaders.chatHandles.load(chat.id);
  },
};
