import path from 'path';
import { promisify } from 'util';
import child_process from 'child_process';

const exec = promisify(child_process.exec);
const escapeBash = (str) => `"${str.replace(/"/g, '\\"')}"`;
const resolveScript = (name) => path.resolve(__dirname, `${name}.applescript`);

export async function sendMessage(id, message) {
  const { stdout, stderr } = await exec(
    `osascript ${resolveScript('sendmessage')} "${id}" ${escapeBash(message)}`
  );

  return !stderr;
}
