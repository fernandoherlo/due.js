import * as Tone from 'tone';
import { ISynth, IApp } from '~/src/vite-env';
import Instrument from '..';

export default class Synth extends Instrument implements ISynth {
  protected _instrument: Tone.Synth<Tone.SynthOptions> | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this._canUpdate = true;
  }

  async start (): Promise<void> {
    let connect: any | null;
    if (this.actions.length) {
      connect = await this.startActions();
    }

    this._instrument = new Tone.Synth();
    this._instrument.debug = this._app.$debug;

    if (connect) {
      this._instrument.connect(connect._effect);
    } else {
      this._instrument.toDestination();
    }

    await super.start();
  }
}
