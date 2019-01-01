import env from 'dotenv';

// Assign the default NODE_ENV to development
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const config = env.config().parsed;

if (!config) {
  console.error('.env file is undefined!');
  process.exit();
}

if (
  process.env.NODE_ENV === 'production' &&
  config.JWT_SECRET === 'your_secret'
) {
  console.error(
    'You must change the default JWT_SECRET in .env when running in production!'
  );
  process.exit();
}

export default config;
