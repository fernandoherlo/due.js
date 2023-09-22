import * as Tone from 'tone';
import { ISynth } from '../../../vite-env';
import Instrument from '..';

export default class Synth extends Instrument implements ISynth {
  _instrument: Tone.Synth<Tone.SynthOptions> | null = null;
  _canUpdate: boolean = true;

  async start (): Promise<void> {
    await super.start();

    this._instrument = new Tone.Synth().toDestination();
    await this.play();
  }

  async play (): Promise<void> {
    await super.play();

    if (this._instrument) {
      this._instrument.triggerAttackRelease(this.value, '8n');
    }

    setTimeout(() => this.play(), 1000);
  }

  async end (): Promise<void> {
    await super.end();

    if (this._instrument) {
      await this._instrument.dispose();
    }
  }

  async update (newInstrument: ISynth): Promise<void> {
    await super.update(newInstrument);

    await this.play();
  }
}
