import _ from 'hibar';
import DataLoader from 'dataloader';

const orderArrayByIds = (arr, ids, key = 'id') => {
  const map = arr.reduce((m, e) => ((m[e[key]] = e), m), {});
  return ids.map((id) => map[id]);
};

export default function createLoaders(ctx) {
  const { db } = ctx;

  return {
    handles: new DataLoader((ids) =>
      db
        .all(
          `
          SELECT ROWID as id, id as username, country, service
          FROM handle
          WHERE ROWID in (${ids.join(', ')});
        `
        )
        .then((handles) => orderArrayByIds(handles, ids))
    ),

    chatHandles: new DataLoader((chatIds) => {
      return db
        .all(
          `
           SELECT ROWID as id, id as username, country, service, chat_id
           FROM handle
           JOIN chat_handle_join ON chat_handle_join.handle_id = handle.ROWID
           WHERE chat_id IN (${chatIds.join(', ')});
        `
        )
        .then((handles) => {
          const groups = _.groupBy(handles, (handle) => handle.chat_id);
          return chatIds.map((id) => groups[id]);
        });
    }),

    lastMessage: new DataLoader((chatIds) => {
      return db
        .all(
          `
          SELECT ROWID as id, guid, text, date, is_from_me,
            cache_has_attachments, handle_id, chat_message_join.chat_id
          FROM message
          JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
          WHERE chat_message_join.chat_id IN (${chatIds.join(', ')})
          GROUP BY chat_id
          ORDER BY date DESC;
        `
        )
        .then((messages) => {
          return orderArrayByIds(messages, chatIds, 'chat_id');
        });
    }),
  };
}
