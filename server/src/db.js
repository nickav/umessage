import path from 'path';
import os from 'os';
import sqlite from 'sqlite';

async function createDatabase() {
  const messagesPath = path.resolve(os.homedir(), 'Library/Messages/chat.db');
  const db = await sqlite.open(messagesPath, sqlite.OPEN_READONLY);
  db.on('trace', console.log);
  return db;
}

export default createDatabase;
