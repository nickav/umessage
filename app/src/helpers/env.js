const Env = {
  dev: {
    API_URL: 'http://localhost:3001/graphql',
    WS_URL: 'ws://localhost:3001/graphql',
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
