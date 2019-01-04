import { Constants } from 'expo';

const Env = {
  dev: {
    API_URL: 'http://192.168.0.164:3001/graphql',
    WS_URL: 'ws://192.168.0.164:3001/graphql',
  },
  staging: {
    API_URL: '',
    WS_URL: '',
  },
  prod: {
    API_URL: '',
    WS_URL: '',
  },
};

const getEnvVars = (env = '') => {
  if (env.indexOf('staging') !== -1) return Env.staging;
  if (env.indexOf('prod') !== -1) return Env.prod;
  return Env.dev;
}

export default getEnvVars(Constants.manifest.releaseChannel);
