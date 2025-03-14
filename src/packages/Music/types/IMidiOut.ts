import { IInstrument } from '~/src/vite-env';

export interface IMidiOut extends IInstrument {
  update: (newIntrument: IMidiOut) => Promise<void>;
}
