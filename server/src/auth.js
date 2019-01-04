import { promisify } from 'util';
import _ from 'hibar';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

import config from './config';

export const authUser = (ctx, { email, password }) => {
  if (config.USER_EMAIL === email) {
    return bcrypt.compare(password, config.USER_PASSWORD).then((valid) => {
      if (!valid) return Promise.resolve(null);

      const data = { email };
      return promisify(jsonwebtoken.sign)(data, config.JWT_SECRET);
    });
  }

  return Promise.resolve(null);
};

export function getUserFromJwt(ctx, jwt) {
  if (typeof jwt === 'string') {
    jwt = jsonwebtoken.decode(jwt, config.JWT_SECRET);
  }

  if (jwt) {
    return jwt;
  }

  return Promise.resolve(null);
}

export const isAuthenticated = (userPromise) =>
  Promise.resolve(userPromise).then((user) =>
    user ? user : Promise.reject(new Error('Unauthorized'))
  );

export async function authMiddleware(ctx, next) {
  ctx.user = await getUserFromJwt(ctx, ctx.state.user);
  return next();
}
