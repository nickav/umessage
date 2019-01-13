import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const getTokenPath = () => path.resolve(__dirname, '../bin/device-token');

let inMemoryToken = '';

export const getToken = () => {
  if (inMemoryToken) {
    return Promise.resolve(inMemoryToken);
  }

  return readFile(getTokenPath())
    .then((contents) => contents.toString())
    .catch((err) => {
      console.error('Failed reading token', err);
      return '';
    });
};

export const setToken = (token) => {
  return writeFile(getTokenPath(), token)
    .then(() => {
      inMemoryToken = token;
      console.log('setToken', token);
      return true;
    })
    .catch((err) => {
      console.error('Failed to set token', err);
      return false;
    });
};
