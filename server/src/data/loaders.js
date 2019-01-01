import DataLoader from 'dataloader';

const orderArrayByIds = (arr, ids) => {
  const map = arr.reduce((m, e) => ((m[e.id] = e), m), {});
  return ids.map((id) => map[id]);
};

export default function createLoaders(ctx) {
  return {
    handles: new DataLoader((ids) =>
      ctx.db
        .get(
          `SELECT ROWID as id, id as username, country, service from handle WHERE ROWID in (:ids);`,
          { ids }
        )
        .then((handles) => orderArrayByIds(handles, ids))
    ),

    lastMessage: new DataLoader((groupIds) => {
      const sql = `SELECT m.* from messages m
        JOIN (SELECT groupId, MAX(sort) sort FROM messages WHERE groupId IN (:groupIds) GROUP BY groupId) l
        ON m.groupId = l.groupId AND m.sort = l.sort;`;

      return ctx.db
        .query(sql, { replacements: { groupIds } })
        .then((results) => {
          const messages = results[0];

          const groupMap = messages.reduce(
            (m, e) => ((m[e.groupId] = e), m),
            {}
          );

          return groupIds.map((groupId) =>
            ctx.db.Message.build(groupMap[groupId])
          );
        });
    }),
  };
}
