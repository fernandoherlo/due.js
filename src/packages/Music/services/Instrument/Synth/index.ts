import type { ISynth, IApp } from '~/src/types';
import * as Tone from 'tone';
import Instrument from '..';

export default class Synth extends Instrument implements ISynth {
  protected instrument: Tone.Synth<Tone.SynthOptions> | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this.canUpdate = true;
  }

  async start (): Promise<void> {
    let connect: any | null;
    if (this.actions.length) {
      connect = await this.startActions();
    }

    this.instrument = new Tone.Synth();
    this.instrument.debug = this.app.__debugEnabled;

    if (connect) {
      this.instrument.connect(connect.effect);
    } else {
      this.instrument.toDestination();
    }

    await super.start();
  }
}
