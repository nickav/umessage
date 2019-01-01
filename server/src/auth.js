import _ from 'hibar';
import jsonwebtoken from 'jsonwebtoken';

import config from './config';

export function signInUser(ctx, id) {
  return ctx.db.User.findOne({ where: { id } }).then((user) => {
    const data = { id };

    return jsonwebtoken.sign(data, config.JWT_SECRET);
  });
}

export function userFromJWT(db, jwt) {
  if (typeof jwt === 'string') {
    jwt = jsonwebtoken.decode(jwt, config.JWT_SECRET);
  }

  if (jwt) {
    const { id } = jwt;
    return db.User.findOne({ where: { id } });
  }

  return Promise.resolve(null);
}

export const isAuthenticated = (userPromise) =>
  Promise.resolve(userPromise).then((user) =>
    user ? user : Promise.reject(new Error('Unauthorized'))
  );

export async function authMiddleware(ctx, next) {
  ctx.user = await userFromJWT(ctx.db, ctx.state.user);
  return next();
}
