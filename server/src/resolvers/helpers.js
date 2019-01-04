import { combineResolvers } from 'graphql-resolvers';
import _ from 'hibar';

export const isAuthenticated = (root, args, context, info) => {
  if (!context.user) {
    return context.throw(401, 'Unauthorized');
  }
};

export const auth = (...fns) => combineResolvers(isAuthenticated, ...fns);

export const authResolver = (...fns) => (obj) =>
  _.mapValues(obj, (v) => auth(...fns, v));

export const arrayEquals = (a1, a2, orderDependent = false) => {
  if (!orderDependent) {
    a1 = a1.slice().sort();
    a2 = a2.slice().sort();
  }

  return JSON.stringify(a1) === JSON.stringify(a2);
};

export const unique = (arr) =>
  Object.keys(arr.reduce((acc, val) => ({ ...acc, [val]: true }), {}));

/**
 * Date parsing extracted from:
 * @see {@link https://github.com/wtfaremyinitials/osa-imessage/blob/master/index.js}
 */

// Instead of doing something reasonable, Apple stores dates as the number of
// seconds since 01-01-2001 00:00:00 GMT. DATE_OFFSET is the offset in seconds
// between their epoch and unix time
const DATE_OFFSET_SECS = 978307200;

// Since macOS 10.13 High Sierra, some timestamps appear to have extra data
// packed. Dividing by 10^9 seems to get an Apple-style timestamp back.
// According to a StackOverflow user, timestamps now have nanosecond precision
const unpackTime = (ts) => Math.floor(ts / Math.pow(10, 9));

// Transforms an Apple-style timestamp to a proper unix timestamp
export const fromAppleTime = (ts) => {
  if (ts === 0) {
    return null;
  }

  // TODO: test this
  // unpackTime returns 0 if the timestamp wasn't packed with nanosecond precision
  if (unpackTime(ts) !== 0) {
    return new Date(ts / Math.pow(10, 6) + DATE_OFFSET_SECS * 1000);
  }

  return new Date((ts + DATE_OFFSET_SECS) * 1000);
};

export const transformMessage = (message) => ({
  ...message,
  date: fromAppleTime(message.date),
});

// convert cursor to id
export const fromCursor = (str) => Buffer.from(str, 'base64').toString();

// convert id to cursor
export const toCursor = (val) => Buffer.from(val.toString()).toString('base64');

export const fromSortCursor = (cursor) => +fromCursor(cursor);

export const toSortCursor = (item) => (item ? toCursor(`${item.id}`) : null);
