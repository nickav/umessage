const ip = '192.168.0.164';
//const ip = '192.168.1.180';

const Env = {
  dev: {
    API_URL: `http://${ip}:3001`,
    GRAPHQL_URL: `http://${ip}:3001/graphql`,
  },
  prod: {
    API_URL: 'http://68.195.141.219:22222',
    GRAPHQL_URL: 'http://68.195.141.219:22222/graphql',
  },
};

const getEnvVars = () => {
  return __DEV__ ? Env.dev : Env.prod;
};

export default getEnvVars();
