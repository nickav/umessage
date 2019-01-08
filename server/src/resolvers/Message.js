export default {
  handle(message, args, ctx) {
    return ctx.loaders.handles.load(message.handle_id);
  },

  attachments(message, args, ctx) {
    if (message.cache_has_attachments) {
      return ctx.loaders.attachments.load(message.id);
    }
  },

  chat(message, args, ctx) {
    return ctx.loaders.messageChats.load(message.id);
  },
};
