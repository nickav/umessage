import path from 'path';
import os from 'os';
import send from 'koa-send';

async function getAttachment(ctx) {
  const { db } = ctx;

  const attachment = await db.get(`
    SELECT ${db.getAttachmentProps()} FROM attachment
    WHERE ROWID = ${ctx.params.id};
  `);

  const prefix = '~/Library/Messages/Attachments/';
  const { filename } = attachment;

  if (!filename.startsWith(prefix)) {
    return ctx.throw(400);
  }

  const root = path.resolve(os.homedir(), 'Library/Messages/Attachments');

  await send(ctx, filename.substr(prefix.length), { root });
}

export default getAttachment;
