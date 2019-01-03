import { onMessageAdded } from './resolvers/Subscription';

export default (ctx) => {
  setInterval(() => onMessageAdded({ text: 'test' }), 2000);
};
