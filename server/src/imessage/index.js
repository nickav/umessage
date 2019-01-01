const exec = util.promisify(require('child_process').exec);

export async function sendMessage(id, message) {
  const { stdout, stderr } = await exec(
    `osascript sendmessage.applescript "${id}" ${escsh(message)}`
  );

  return !stderr;
}
