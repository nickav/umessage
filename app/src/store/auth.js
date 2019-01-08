import { AsyncStorage } from 'react-native';

export const setAuth = (id, token) => {
  return AsyncStorage.multiSet([['id', id], ['token', token]]);
};

export const getUserId = async () => AsyncStorage.getItem('id');

export const getToken = async () => AsyncStorage.getItem('token');

export const invalidateAuth = () => {
  return AsyncStorage.multiRemove(['id', 'token']);
};
