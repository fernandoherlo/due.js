import type { IInstrument } from '~/src/types';

export interface ISynth extends IInstrument {
  update: (newIntrument: ISynth) => Promise<void>;
}
