import dayjs from 'dayjs';
import DeviceInfo from 'react-native-device-info';
import emojiRegex from 'emoji-regex/text';

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

const arrCollect = (arr, equals = () => false) =>
  arr.reduce(
    (result, curr, i, arr) => {
      const group = result[result.length - 1];
      const prev = group[group.length - 1];

      if (!prev || equals(prev, curr, group, i, arr)) {
        group.push(curr);
      } else {
        result.push([curr]);
      }

      return result;
    },
    [[]]
  );

export const createMessageBlocks = (
  messages,
  options = { groupTime: 60 * 60 * 1000 }
) =>
  arrCollect(
    messages.map((e) => ({
      ...e,
      time: new Date(e.date).getTime(),
    })),
    (a, b) =>
      a.handle_id === b.handle_id &&
      a.is_from_me === b.is_from_me &&
      Math.abs(a.time - b.time) < options.groupTime
  )
    .map((e) => {
      const messages = e.reverse();
      return { type: 'messages', messages, id: messages[0].id };
    })
    .reduce((result, curr, i, arr) => {
      const prev = arr[i - 1];
      const { date, time } = curr.messages[0];
      const prevTime = prev ? prev.messages[0].time : 0;

      // insert time blocks
      if (prevTime && Math.abs(time - prevTime) >= options.groupTime) {
        result.push({ type: 'time', time: prevTime, id: prevTime });
      }

      result.push(curr);
      return result;
    }, []);

export const isOnlyEmojis = (text) => {
  const noEmojis = text.replace(emojiRegex(), '');
  const noSpace = noEmojis.replace(/\s+/gm, '');
  return !noSpace;
};

export const isLargeText = (text) => isOnlyEmojis(text);

export const filterText = (text) => {
  // remove object replacement codes [obj]
  return text.replace(/\uFFFC/g, '');
};
