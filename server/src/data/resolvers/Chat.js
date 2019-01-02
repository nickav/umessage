import { toSortCursor } from '../pagination';

export default {
  messagePage: (chat, args, ctx) => {
    const { page } = args;
    const groupId = chat.id;

    if (page.count === 1 && !page.cursor) {
      return ctx.loaders.lastMessage.load(chat.id).then((message) => ({
        cursor: toSortCursor(message),
        items: [message].filter((e) => e),
      }));
    }

    return {
      items: [],
      cursor: '1',
    };
  },

  handles: (chat, args, ctx) => {
    return ctx.loaders.chatHandles.load(chat.id);
  },
};
