import * as Tone from 'tone';
import { IInstrument } from '~/src/vite-env';

export interface ISynth extends IInstrument {
  _instrument: Tone.Synth<Tone.SynthOptions> | null;

  update: (newIntrument: ISynth) => Promise<void>;
}
