import path from 'path';
import child_process from 'child_process';
import { promisify } from 'util';

import _ from 'hibar';

const exec = promisify(child_process.exec);
const escapeBash = (str) => `"${str.replace(/"/g, '\\"')}"`;
const resolveScript = (name) => path.resolve(__dirname, `${name}.applescript`);

export async function sendMessage(handleGuids, message) {
  const handles = _.toArray(handleGuids);

  if (!handles.length) {
    return Promise.reject('sendMessage: Must supply at least one handle.');
  }

  const handle = handles.join(',');

  const { stdout, stderr } = await exec(`
    osascript ${resolveScript('sendmessage')} ${escapeBash(
    handle
  )} ${escapeBash(message)}
  `);

  return !stderr;
}
