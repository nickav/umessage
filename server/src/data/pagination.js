// convert cursor to id
export const fromCursor = (str) => Buffer.from(str, 'base64').toString();

// convert id to cursor
export const toCursor = (val) => Buffer.from(val.toString()).toString('base64');

export const fromSortCursor = (cursor) => +fromCursor(cursor);

export const toSortCursor = (item) => (item ? toCursor(`${item.sort}`) : null);

export const paginate = (collection, { page, where = {} }, ctx) => {
  const { count: limit, cursor } = page;

  if (cursor) where.sort = { $lt: fromSortCursor(cursor) };

  const order = [['sort', 'DESC']];

  return collection.findAll({ where, order, limit }).then((items) => {
    return {
      cursor: toSortCursor(items[items.length - 1]),
      items: items.filter((e) => e),
      pageInfo: getPageInfo(collection, items, {
        where,
        limit,
      }),
    };
  });
};

export const getPageInfo = (collection, items, { where, limit }) => ({
  hasNextPage() {
    if (items.length < limit) {
      return Promise.resolve(false);
    }

    return collection
      .findOne({
        where: {
          ...where,
          sort: {
            $lt: items[items.length - 1].sort,
          },
        },
        order: [['sort', 'DESC']],
      })
      .then((item) => !!item);
  },

  hasPreviousPage() {
    return collection
      .findOne({ where, order: [['sort']] })
      .then((item) => !!item);
  },
});
