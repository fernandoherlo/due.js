import * as Tone from 'tone';
import { IInstrument } from '../../../vite-env';

export interface ISynth extends IInstrument {
  _instrument: Tone.Synth<Tone.SynthOptions> | null;
  _schedule: number | null;

  update: (newIntrument: ISynth) => Promise<void>;
}
