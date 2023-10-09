import { IInstrument } from '~/src/vite-env';

export interface IMidi extends IInstrument {
  _instrument: any | null;

  update: (newIntrument: IMidi) => Promise<void>;
}
