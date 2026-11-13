import type { ISynth, IApp } from '~/src/types';
import * as Tone from 'tone';
import Instrument from '..';
import { EFFECTS_MAP } from '../../../constants/effects';
import { isSynthPreset, SYNTH_PRESETS } from '~/src/packages/Music/constants/synths';

export default class Synth extends Instrument implements ISynth {
  protected instrument: Tone.Synth<Tone.SynthOptions> | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this.canUpdate = true;
  }

  async start (): Promise<void> {
    let connect: any | null;
    if (this.actions.length) {
      connect = await this.startActions(EFFECTS_MAP);
    }

    const options = this.modifier && isSynthPreset(this.modifier) ? SYNTH_PRESETS[this.modifier] : {};
    this.instrument = new Tone.Synth(options);
    this.instrument.debug = this.app.__debugEnabled;

    if (connect) {
      this.instrument.connect(connect.effect);
    } else {
      this.instrument.toDestination();
    }

    await super.start();
  }

  async update (newInstrument: ISynth): Promise<void> {
    if (this.modifier !== newInstrument.modifier) {
      await this.end();
      this.value = newInstrument.value;
      this.typeValue = newInstrument.typeValue;
      this.modifier = newInstrument.modifier;
      this.actions = newInstrument.actions;
      this.setOperators(newInstrument.actions);
      await this.start();
      return;
    }

    await super.update(newInstrument);
  }
}
