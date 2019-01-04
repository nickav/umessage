import store from '@/store/local';

export const setAuth = (id, token) => {
  store.setItem('id', id);
  store.setItem('token', token);
};

export const getUserId = () => store.getItem('id');

export const getToken = () => store.getItem('token');

export const getUser = () => {
  const id = getUserId();
  return id ? { id } : null;
};

export const invalidateAuth = () => {
  store.removeItem('token');
  store.removeItem('id');
};
