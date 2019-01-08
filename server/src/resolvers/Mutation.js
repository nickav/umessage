import { sendMessage } from '../imessage';
import { auth } from '../auth';

export default {
  auth: (_, args, ctx) => auth(ctx, args),

  sendMessage: (_, { handleGuids, text }, ctx) => {
    const sanitizedText = text.trim();

    return sendMessage(handleGuids, sanitizedText)
      .then(() => true)
      .catch((err) => {
        console.error(err);
        return false;
      });
  },
};
