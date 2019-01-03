import _ from 'hibar';
import DataLoader from 'dataloader';

import { fromAppleTime } from './resolvers/helpers';

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
          SELECT ROWID as id, id as guid, country, service
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
           SELECT ROWID as id, id as guid, country, service, chat_id
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
            cache_has_attachments, handle_id, chat_message_join.chat_id,
            associated_message_guid
          FROM message
          JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
          WHERE chat_message_join.chat_id IN (${chatIds.join(', ')})
          GROUP BY chat_id
          ORDER BY date DESC;
          `
        )
        .then((messages) =>
          messages.map((message) => ({
            ...message,
            date: fromAppleTime(message.date),
          }))
        )
        .then((messages) => {
          return orderArrayByIds(messages, chatIds, 'chat_id');
        });
    }),

    attachments: new DataLoader((messageIds) => {
      return db
        .all(
          `
        SELECT ROWID as id, guid, created_date, mime_type, transfer_name,
          filename, is_outgoing, total_bytes, hide_attachment, message_id
        FROM attachment
        JOIN message_attachment_join ON attachment.ROWID = message_attachment_join.attachment_id
        WHERE message_id IN (${messageIds.join(', ')});
        `
        )
        .then((attachments) =>
          attachments.map((attachment) => ({
            ...attachment,
            created_date: fromAppleTime(attachment.created_date),
          }))
        )
        .then((attachments) => {
          const groups = _.groupBy(
            attachments,
            (attachment) => attachment.message_id
          );
          return messageIds.map((id) => groups[id]);
        });
    }),
  };
}
