import metascraper from 'metascraper';
import got from 'got';
import { transformMessage } from './helpers';

export default {
  handles: (_, args, ctx) =>
    ctx.db.all(`SELECT ROWID as id, id as guid, country, service FROM handle;`),

  chats: (_, args, ctx) =>
    ctx.db.all(`
      SELECT chat.ROWID as id, chat.guid, chat.chat_identifier
      FROM message
      JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
      JOIN chat ON chat_message_join.chat_id = chat.ROWID
      GROUP BY chat_id
      ORDER BY date DESC;
    `),

  chat: (_, args, ctx) =>
    ctx.db.get(`
    SELECT chat.ROWID as id, chat.guid, chat.chat_identifier
    FROM chat
    WHERE ROWID = ${args.id};
  `),

  metatags: (_, args, ctx) =>
    got(args.url).then(({ body: html, url }) => metascraper({ html, url })),
};
