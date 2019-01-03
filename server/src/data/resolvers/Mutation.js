import { sendMessage } from '../../imessage';

export default {
  sendMessage(_, { handleGuids, text }, ctx) {
    const sanitizedText = text.trim();

    return sendMessage(handleGuids, sanitizedText)
      .then(() => true)
      .catch((err) => {
        console.error(err);
        return false;
      });
  },
};
