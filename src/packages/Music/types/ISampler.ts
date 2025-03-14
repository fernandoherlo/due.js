import { IInstrument } from '~/src/vite-env';

export interface ISampler extends IInstrument {
  update: (newIntrument: ISampler) => Promise<void>;
}
