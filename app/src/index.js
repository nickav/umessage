import { KeepAwake, registerRootComponent } from 'expo';

import App from '@/components/App';

if (__DEV__) {
  KeepAwake.activate();
}

registerRootComponent(App);
