const path = require('path');
const os = require('os');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const sqlite = require('sqlite');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

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

async function getLastNMessagesFromHandle(db, n, handle) {
  return await db.all(`
    SELECT message.* FROM message
    WHERE message.handle_id = ${handle}
    ORDER BY date DESC LIMIT ${n};
  `);
}

async function getMessagesAfterDate(db, date = 0) {
  return await db.all(`
    SELECT * FROM message
    JOIN handle on handle.ROWID = message.handle_id
    WHERE date > ${date}
    ORDER BY date DESC;
  `);
}

async function getRecentChats(db, limit = 20) {
  const query = `
    SELECT chat.* FROM chat
    JOIN chat_handle_join ON chat_handle_join.chat_id = chat.ROWID
    JOIN handle ON handle.ROWID = chat_handle_join.handle_id
    ORDER BY handle.rowid DESC
    LIMIT ${limit};
  `;

  return await db.all(query);
}

async function bulkGetMessageAttachments(db, messageIds = []) {
  const query = `
    SELECT * FROM message_attachment_join
    JOIN attachment ON attachment.ROWID = message_attachment_join.attachment_id
    WHERE message_id IN (${messageIds.join(', ')});
  `;
  return await db.all(query);
}

async function getHandle(db, id) {
  const query = `SELECT * FROM handle WHERE ROWID = ${id}`;
  return await db.get(query);
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

  const app = new Koa();

  app.use(bodyParser());

  app.use(async function(ctx) {
    // parse params
    const params = ctx.request.query;
    const limit = params.limit ? parseInt(params.limit, 10) : 20;
    const id = params.handle ? parseInt(params.handle, 10) : -1;

    // check if sending
    const { body } = ctx.request;
    if (body.text) {
      const handle = await getHandle(db, id);

      if (handle) {
        const result = await sendMessage(handle.id, body.text);
        console.log(params, body, handle);
        ctx.body = result;
      } else {
        ctx.body = 'Handle not found.';
      }
      return;
    }

    const messages = await getLastNMessagesFromHandle(db, limit, id);
    const json = messages
      .map((m) => ({
        text: m.text,
        is_from_me: m.is_from_me,
        cache_has_attachments: m.cache_has_attachments,
      }))
      .reverse();

    const form = `<form id="message" method="POST" action="/send">
      <textarea name="text"></textarea>
      <input type="submit" value="Submit" />
    </form>
    <script>
      const params = new URLSearchParams(window.location.search);
      const form = document.getElementById('message');

      form.addEventListener('submit', e => {
        const formData = new FormData(form);
        const json = Array.from(formData.entries()).reduce((memo, pair) => ({
          ...memo,
          [pair[0]]: pair[1],
        }), {}); 

        const handle = params.get('handle');

        fetch('/send?handle=' + handle, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(json)
        }).then(() => {
          form.reset();
          window.location.reload();
        });

        e.preventDefault();
      });
    </script>
      `;

    ctx.body = `<html><body><pre>${JSON.stringify(
      json,
      null,
      2
    )}</pre>${form}</body></html>`;
  });

  app.listen(22222, '0.0.0.0');

  return;

  pollMessages(db, 400, (rawMessages) => {
    const messages = rawMessages.filter((message) => !message.is_from_me);

    if (!messages.length) return;

    console.log(`Recieved ${messages.length} message(s).`);

    // auto-responder
    messages.forEach((message) => {
      if (message.id === '+12013167490') {
        if (message.text === 'hi') {
          console.log('  Responding...');
          sendMessage(message.id, `Hey bb`);
        }
      }
    });
  });
}

main();
