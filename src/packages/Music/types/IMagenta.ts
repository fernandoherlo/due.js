import type { ISampler } from '~/src/types';

export interface IMagenta extends ISampler {
  update: (newIntrument: IMagenta) => Promise<void>;
}
