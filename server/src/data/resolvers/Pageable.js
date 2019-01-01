export default {
  __resolveType: (obj, args, ctx) => {
    return obj.text ? 'Message' : 'Handle';
  },
};
