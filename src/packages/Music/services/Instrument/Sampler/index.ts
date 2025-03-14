import * as Tone from 'tone';
import { IInstrument, ISampler, IApp } from '~/src/vite-env';
import { compareInstructions } from '~/src/packages/Compiler/services/Instruction/compare';
import samples from '../../../constants/samples.json';
import Instrument from '..';
import { SAMPLER_MAP } from '../../../constants';

export default class Sampler extends Instrument implements ISampler {
  protected _instrument: Tone.Sampler | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this._canUpdate = true;
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

    this._instrument = (await samplerPromise);
    this._instrument.debug = this._app.$debug;

    if (connect) {
      this._instrument.connect(connect._effect);
    } else {
      this._instrument.toDestination();
    }

    await super.start();
  }

  async update (newInstrument: IInstrument): Promise<void> {
    if (this._canUpdate) {
      await this.setNewValue(newInstrument);

      if (
        this.modifier !== newInstrument.modifier ||
        this.actions.some((action, index) => compareInstructions(newInstrument.actions?.[index], action)) ||
        newInstrument.actions.some((action, index) => compareInstructions(this.actions?.[index], action))
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

  _pathUrl (notes: any, sound: string): any {
    const pathNotes: any = {};

    Object.keys(notes).forEach((note) => {
      pathNotes[note] = `samples/${sound}/${notes[note]}`;
    });

    return pathNotes;
  }
}
