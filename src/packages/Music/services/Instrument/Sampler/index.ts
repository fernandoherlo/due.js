import type { IInstrument, ISampler, IApp } from '~/src/types';
import * as Tone from 'tone';
import { areDifferentInstructions } from '~/src/packages/Compiler/services/Instruction/compare';
import samples from '../../../constants/samples.json';
import Instrument from '..';
import { SAMPLER_MAP } from '../../../constants';

export default class Sampler extends Instrument implements ISampler {
  protected instrument: Tone.Sampler | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this.canUpdate = true;
  }

  async start (): Promise<void> {
    let connect: any | null = null;
    if (this.actions.length) {
      connect = await this.startActions();
    }

    const samplesMap: any = samples;
    const samplerPromise: Promise<Tone.Sampler> = new Promise((resolve) => {
      const sound = this.modifier || 'piano';
      const sampler: Tone.Sampler = new Tone.Sampler({
        urls: this._pathUrl(samplesMap[SAMPLER_MAP[sound]], SAMPLER_MAP[sound]),
        onload: function onload () {
          return resolve(sampler);
        }
      });
    });

    this.instrument = (await samplerPromise);
    this.instrument.debug = this.app.__debugEnabled;

    if (connect) {
      this.instrument.connect(connect.effect);
    } else {
      this.instrument.toDestination();
    }

    await super.start();
  }

  async update (newInstrument: IInstrument): Promise<void> {
    if (this.canUpdate) {
      await this.setNewValue(newInstrument);

      if (
        this.modifier !== newInstrument.modifier ||
        this.actions.some((action, index) => areDifferentInstructions(newInstrument.actions?.[index], action)) ||
        newInstrument.actions.some((action, index) => areDifferentInstructions(this.actions?.[index], action))
      ) {
        await this.end();

        this.modifier = newInstrument.modifier;
        this.actions = newInstrument.actions;

        await this.start();
      } else {
        await super.start();
      }
    }
  }

  async setNewValue (newInstrument: IInstrument) {
    this.value = newInstrument.value;
    this.typeValue = newInstrument.typeValue;
  }

  private _pathUrl (notes: any, sound: string): any {
    const pathNotes: any = {};

    Object.keys(notes).forEach((note) => {
      pathNotes[note] = `samples/${sound}/${notes[note]}`;
    });

    return pathNotes;
  }
}
