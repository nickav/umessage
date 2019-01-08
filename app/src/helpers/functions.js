import dayjs from 'dayjs';

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
    (diff) => (diff < 7 ? 'ddd, h:mm a' : 'MMM D, h:mm a')
  );

export const prettyTime = (ms) =>
  formatCalendarDate(
    ms,
    (diff) => (diff < 7 ? 'dddd • h:mm a' : 'dddd, MMM D • h:mm a')
  );

export const getFakeId = (() => {
  let id = 0;
  return () => --id;
})();
