import { IInstrument } from '~/src/vite-env';

export interface IMagenta extends IInstrument {
  _instrument: any | null;

  update: (newIntrument: IMagenta) => Promise<void>;
}
