export default {
  hasNextPage(pageInfo, args) {
    return pageInfo.hasNextPage();
  },
  hasPreviousPage(pageInfo, args) {
    return pageInfo.hasPreviousPage();
  },
};
