import { ISampler } from '~/src/vite-env';

export interface IMagenta extends ISampler {
  update: (newIntrument: IMagenta) => Promise<void>;
}
