import type { IInstrument } from '~/src/types';

export interface ISampler extends IInstrument {
  update: (newIntrument: ISampler) => Promise<void>;
}
