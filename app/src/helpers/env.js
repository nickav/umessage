const ip = '192.168.1.180';

const Env = {
  dev: {
    BASE_URL: 'http://localhost:3001'.replace('localhost', ip),
    API_URL: 'http://localhost:3001/graphql'.replace('localhost', ip),
    WS_URL: 'ws://localhost:3001/graphql'.replace('localhost', ip),
  },
  prod: {
    BASE_URL: '',
    API_URL: '',
    WS_URL: '',
  },
};

const getEnvVars = () => {
  return __DEV__ ? Env.dev : Env.prod;
};

export default getEnvVars();
