import dayjs from 'dayjs';

const newestLastSort = (a, b) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

export const prettyTime = (ms) =>
  dayjs(ms).calendar(null, {
    sameDay: 'LT',
    lastDay: 'ddd',
    lastWeek: 'MMM D',
    sameElse: function(now) {
      return 'DD/MM/YYYY';
    },
  });

export const prettyDatetime = (ms) =>
  dayjs(ms).calendar(null, {
    sameDay: 'LT',
    lastDay: 'ddd LT',
    lastWeek: 'ddd LT',
    sameElse: function(now) {
      return 'MMM Do, LT';
    },
  });

export const arrayCollect = (array, equals = (a, b) => false) => {
  if (!array.length) return [];

  let prev = array[0];
  const result = [[prev]];

  for (let i = 1, n = array.length; i < n; i++) {
    let curr = array[i];

    if (equals(prev, curr)) {
      result[result.length - 1].push(curr);
    } else {
      result.push([curr]);
    }

    prev = curr;
  }

  return result;
}

export const convertToMessageGroups = (messages, insertTimesAfter = 3600000) => {
  const groups = arrayCollect(
    messages.map((m) => ({
      ...m,
      createdAtTime: new Date(m.createdAt).getTime(),
    })),
    (a, b) =>
      a.from.id === b.from.id &&
      Math.abs(a.createdAtTime - b.createdAtTime) < insertTimesAfter
  );

  if (!groups.length) return [];

  const toGroupResult = (group) => {
    const last = group[group.length - 1];
    return {
      ...last,
      type: 'messages',
      messages: group.sort((a, b) => a.sort - b.sort),
    };
  };

  const toTimeResult = (group) => ({
    id: group.createdAt,
    type: 'time',
    time: prettyDatetime(group.createdAt),
  });

  const result = [toGroupResult(groups[0])];

  for (let i = 1, n = groups.length; i < n; i++) {
    const lastGroupSentAt = result[result.length - 1].createdAtTime;
    const group = toGroupResult(groups[i]);

    // insert time block
    if (Math.abs(lastGroupSentAt - group.createdAtTime) >= insertTimesAfter) {
      result.push(toTimeResult(group));
    }

    result.push(group);
  }

  return result;
}
