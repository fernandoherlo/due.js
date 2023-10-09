import { ISampler } from '~/src/vite-env';

export interface IMagenta extends ISampler {
  _instrument: any | null;

  update: (newIntrument: IMagenta) => Promise<void>;
}
