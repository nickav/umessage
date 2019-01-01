const path = require('path');
const os = require('os');
const sqlite = require('sqlite');

async function createDatabase() {
  const messagesPath = path.resolve(os.homedir(), 'Library/Messages/chat.db');
  const db = await sqlite.open(messagesPath, sqlite.OPEN_READONLY);
  return db;
}

export default createDatabase;
