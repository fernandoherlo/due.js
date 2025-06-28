import type { IInstrument } from '~/src/types';

export interface IMidiOut extends IInstrument {
  update: (newIntrument: IMidiOut) => Promise<void>;
}
