import path from 'path';
import os from 'os';
import sqlite from 'sqlite';

async function createDatabase() {
  const messagesPath = path.resolve(os.homedir(), 'Library/Messages/chat.db');
  const db = await sqlite.open(messagesPath, sqlite.OPEN_READONLY);
  db.on('trace', console.log);

  db.getMessageProps = () => `
    message.ROWID as id,
    message.guid,
    message.text,
    message.date,
    message.is_from_me,
    message.cache_has_attachments,
    message.handle_id,
    message.associated_message_guid
  `;

  db.getHandleProps = () => `
    handle.ROWID as id,
    handle.id as guid,
    handle.country,
    handle.service
  `;

  db.getChatProps = () => `
    chat.ROWID as id,
    chat.guid,
    chat.chat_identifier,
    chat.display_name
  `;

  db.getAttachmentProps = () => `
    attachment.ROWID as id,
    attachment.guid,
    attachment.created_date,
    attachment.mime_type,
    attachment.transfer_name,
    attachment.filename,
    attachment.is_outgoing,
    attachment.total_bytes,
    attachment.hide_attachment
  `;

  return db;
}

export default createDatabase;
