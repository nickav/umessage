import metascraper from 'metascraper';
import got from 'got';

import { transformMessage } from './helpers';

export default {
  handles: (_, args, { db }) =>
    db.all(`SELECT ${db.getHandleProps()} FROM handle;`),

  chats: (_, args, { db }) =>
    db.all(`
      SELECT ${db.getChatProps()} FROM message
      JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
      JOIN chat ON chat_message_join.chat_id = chat.ROWID
      GROUP BY chat_id
      ORDER BY date DESC;
    `),

  chat: (_, args, { db }) =>
    db.get(`
      SELECT ${db.getChatProps()} FROM chat
      WHERE ROWID = ${args.id};
    `),

  metatags: (_, args, ctx) =>
    got(args.url).then(({ body: html, url }) => metascraper({ html, url })),
};
