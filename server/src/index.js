import 'babel-polyfill';
import server from './server';

const host = '0.0.0.0';
const port = process.env.PORT || 3001;

server({ host, port });
