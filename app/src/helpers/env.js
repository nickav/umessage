const Env = {
  dev: {
    API_URL: 'http://192.168.0.164:3001/graphql',
    WS_URL: 'ws://192.168.0.164:3001/graphql',
  },
  prod: {
    API_URL: '',
    WS_URL: '',
  },
};

const getEnvVars = () => {
  return __DEV__ ? Env.dev : Env.prod;
}

export default getEnvVars();
