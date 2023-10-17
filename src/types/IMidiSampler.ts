import { ISampler } from '~/src/vite-env';

export interface IMidiSampler extends ISampler {
  _midi: any | null;
}
