const path = require('path');
const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const sqlite = require('sqlite');

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function escsh(str) {
  return `"${str.replace(/"/g, '\\"')}"`;
}

async function sendMessage(id, message) {
  const { stdout, stderr } = await exec(
    `osascript sendmessage.applescript "${id}" ${escsh(message)}`
  );

  return !stderr;
}

async function getMessageCount(db) {
  const result = await db.get(`SELECT count(*) as count FROM message;`);
  return result.count;
}

async function getAllMessages(db) {
  return await db.all(`SELECT * FROM message;`);
}

async function getLastNMessages(db, n = 1) {
  const messages = await db.all(`
    SELECT * FROM message 
    JOIN handle on handle.ROWID = message.handle_id
    ORDER BY date DESC LIMIT ${n};
  `);
  return messages;
}

async function bulkGetMessageAttachments(db, messageIds = []) {
  const query = `
    SELECT * FROM message_attachment_join
    JOIN attachment ON attachment.ROWID = message_attachment_join.attachment_id
    WHERE message_id IN (${messageIds.join(', ')});
  `;
  return await db.all(query);
}

async function pollMessages(db, pollInterval, cb) {
  let lastMessageCount = await getMessageCount(db);

  while (true) {
    const messageCount = await getMessageCount(db);

    if (lastMessageCount !== messageCount) {
      const numRecieved = messageCount - lastMessageCount;
      const newMessages = await getLastNMessages(db, numRecieved);

      cb(newMessages);

      lastMessageCount = messageCount;
    }

    await sleep(pollInterval);
  }
}

async function main() {
  const messagesPath = path.resolve(os.homedir(), 'Library/Messages/chat.db');
  const db = await sqlite.open(messagesPath, sqlite.OPEN_READONLY);
  const ctx = { db };

  pollMessages(db, 400, (rawMessages) => {
    const messages = rawMessages.filter((message) => !message.is_from_me);

    if (!messages.length) return;

    console.log(`Recieved ${messages.length} message(s).`);

    // auto-responder
    messages.forEach((message) => {
      if (message.id === '+12013167490') {
        if (message.text === 'hi') {
          console.log('Responding...');
          sendMessage(message.id, `Hey bb`);
        }
      }
    });
  });
}

main();
