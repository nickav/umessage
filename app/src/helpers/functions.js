import dayjs from 'dayjs';
import DeviceInfo from 'react-native-device-info';

const is24Hour = DeviceInfo.is24Hour();
const timeFormat = is24Hour ? 'HH:mm' : 'h:mm a';

const formatCalendarDate = (date, fn, referenceTime = null) => {
  const then = dayjs(date);
  const now = dayjs(referenceTime || Date.now());
  const days = now.diff(then, 'days', true);
  return then.format(fn(days));
};

const newestLastSort = (a, b) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

export const prettyTimeShort = (ms) =>
  formatCalendarDate(
    ms,
    (diff) => (diff < 7 ? `ddd, ${timeFormat}` : `MMM D, ${timeFormat}`)
  );

export const prettyTime = (ms) =>
  formatCalendarDate(
    ms,
    (diff) => (diff < 7 ? `dddd • ${timeFormat}` : `dddd, MMM D • ${timeFormat}`)
  );

export const getFakeId = (() => {
  let id = 0;
  return () => --id;
})();
