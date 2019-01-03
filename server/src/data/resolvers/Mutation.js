import { sendMessage } from '../../imessage';

export default {
  sendMessage(_, { handleGuid, text }, ctx) {
    const sanitizedText = text.trim();

    return sendMessage(handleGuid, sanitizedText)
      .then(() => true)
      .catch((err) => {
        console.error(err);
        return false;
      });
  },
};
