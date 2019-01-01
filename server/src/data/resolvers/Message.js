export default {
  handle(message, args, ctx) {
    return ctx.loaders.handles.load(message.handle_id);
  },
};
