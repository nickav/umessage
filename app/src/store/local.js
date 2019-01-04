const memoryStore = {};

const isLocalStorageSupported = () => {
  let mod = 'modernizr';
  try {
    localStorage.setItem(mod, mod);
    localStorage.removeItem(mod);
    return true;
  } catch (e) {
    return false;
  }
};

const storeCreator = (prefix, store) => ({
  getItem(key) {
    return JSON.parse(store[`${prefix}${key}`] || null);
  },
  setItem(key, value) {
    store[`${prefix}${key}`] = JSON.stringify(value || null);
  },
  removeItem(key) {
    if (typeof store.removeItem === 'function') {
      store.removeItem(`${prefix}${key}`);
    } else {
      store[`${prefix}${key}`] = null;
    }
  }
});

const store = isLocalStorageSupported() ? localStorage : memoryStore;

export default storeCreator('remark:', store);
