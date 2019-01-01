import metascraper from 'metascraper';
import got from 'got';
import { transformMessage } from './helpers';

export default {
  chatPage: (_, args, ctx) => {
    return {
      pageInfo: {
        hasNextPage() {
          return false;
        },
        hasPreviousPage() {
          return false;
        },
      },
      items: [],
      cursor: '1',
    };
  },

  handles: (_, args, ctx) =>
    ctx.db.all(
      `SELECT ROWID as id, id as username, country, service from handle;`
    ),

  chats: (_, args, ctx) =>
    ctx.db.all(`
      SELECT ROWID as id, guid, chat_identifier, is_archived, service_name
      from chat;
    `),

  messages: (_, args, ctx) =>
    ctx.db
      .all(
        `
        SELECT ROWID as id, guid, text, date, is_from_me, cache_has_attachments,
          handle_id
        from messages
        ORDER BY date DESC
        LIMIT 20;
      `
      )
      .then((messages) => messages.map(transformMessage)),

  metatags: (_, args, ctx) =>
    got(args.url).then(({ body: html, url }) => metascraper({ html, url })),
};
