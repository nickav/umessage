import { promisify } from 'util';
import _ from 'hibar';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';

import config from './config';

const signJwt = promisify(jsonwebtoken.sign);
const decodeJwt = promisify(jsonwebtoken.decode);

export const auth = (ctx, { email, password }) => {
  // allow any user in dev to authenticate
  if (process.env.NODE_ENV === 'development') {
    const data = { email };
    return signJwt(data, config.JWT_SECRET, { expiresIn: '1y' });
  }

  if (config.USER_EMAIL === email) {
    return bcrypt.compare(password, config.USER_PASSWORD).then((valid) => {
      if (!valid) return Promise.resolve(null);

      const data = { email };
      return signJwt(data, config.JWT_SECRET, { expiresIn: '1y' });
    });
  }

  return Promise.resolve(null);
};

export const getUserFromJwt = async (ctx, jwt) => {
  if (typeof jwt === 'string') {
    const user = await decodeJwt(jwt, config.JWT_SECRET);

    if (user) {
      return user;
    }
  }

  return ctx.throw(401, 'Unauthorized');
};
