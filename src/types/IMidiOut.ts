import { IInstrument } from '~/src/vite-env';

export interface IMidiOut extends IInstrument {
  _instrument: any | null;

  update: (newIntrument: IMidiOut) => Promise<void>;
}
