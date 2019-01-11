import dayjs from 'dayjs';
import DeviceInfo from 'react-native-device-info';

const is24Hour = DeviceInfo.is24Hour();
const timeFormat = is24Hour ? 'HH:mm' : 'h:mm a';

const formatCalendarDate = (date, fn, referenceTime = null) => {
  const then = dayjs(date);
  const now = dayjs(referenceTime || Date.now());
  const absoluteDays = now.diff(then, 'days', true);
  const relativeDays = now.diff(then.startOf('day'), 'days', true);
  return then.format(fn(relativeDays, absoluteDays));
};

const minutesAgo = (days) => ~~(days * (24 * 60));
const hoursAgo = (days) => ~~(days * 24);

const timeFromNow = (days) => {
  const mins = ~~(days * 24 * 60);
  const hours = ~~(days * 24);

  if (mins < 1) {
    return '[Now]';
  }

  if (mins < 60) {
    return `[${mins} min]`;
  }

  if (hours < 24) {
    return `[${hours} hr]`;
  }

  return timeFormat;
};

export const prettyTimeShort = (ms) =>
  formatCalendarDate(
    ms,
    (diff) => (diff < 7 ? `ddd, ${timeFormat}` : `MMM D, ${timeFormat}`)
  );

export const prettyTimeTiny = (ms) =>
  formatCalendarDate(ms, (diff, days) => {
    if (diff < 1) {
      const mins = minutesAgo(days);

      return mins < 1 ? '[Now]' : mins < 60 ? `[${mins} min]` : timeFormat;
    }

    return diff < 7 ? `ddd` : `MMM D`;
  });

export const prettyTime = (ms) =>
  formatCalendarDate(
    ms,
    (diff) =>
      diff < 7 ? `dddd • ${timeFormat}` : `dddd, MMM D • ${timeFormat}`
  );

export const getFakeId = (() => {
  let id = 0;
  return () => --id;
})();

export const arrCollect = (arr, equals = () => false) =>
  arr.reduce((result, curr, i, arr) => {
    const group = result[result.length - 1];
    const prev = group[group.length - 1];

    if (equals(prev, curr, group, i, arr)) {
      group.push(curr);
    } else {
      result.push([curr]);
    }

    return result;
  }, arr.length ? [[arr[0]]] : []);

const transformChatSections = (messages, insertTimesAfter = 3600000) =>
  arrCollect(
    messages.map((m) => ({
      ...m,
      createdAtTime: new Date(m.createdAt).getTime(),
    })),
    (a, b) =>
      a.from.id === b.from.id &&
      Math.abs(a.createdAtTime - b.createdAtTime) < insertTimesAfter
  );
