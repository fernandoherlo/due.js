import { IInstrument } from '~/src/vite-env';

export interface ISynth extends IInstrument {
  update: (newIntrument: ISynth) => Promise<void>;
}
