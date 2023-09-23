import * as Tone from 'tone';
import { ISynth } from '../../../vite-env';
import Instrument from '..';

export default class Synth extends Instrument implements ISynth {
  _instrument: Tone.Synth<Tone.SynthOptions> | null = null;
  _canUpdate: boolean = true;

  async start (): Promise<void> {
    const vol = new Tone.Volume(-5).toDestination();

    this._instrument = new Tone.Synth().connect(vol);
    this._instrument.debug = this._app.$debug;

    await super.start();
  }
}
