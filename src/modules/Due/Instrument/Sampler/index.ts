import * as Tone from 'tone';
import { IInstrument, ISampler } from '~/src/vite-env';
import { compareInstructions } from '~/src/modules/Compiler/Instruction/compare';
import samples from '../../samples.json';
import Instrument from '..';
import { SAMPLER_MAP } from '../../constants';

export default class Sampler extends Instrument implements ISampler {
  _instrument: Tone.Sampler | null = null;
  _canUpdate: boolean = true;

  async start (): Promise<void> {
    let connect: any | null = null;
    if (this.actions.length) {
      connect = await this.startActions();
    }

    const samplesMap: any = samples;
    const samplerPromise: Promise<Tone.Sampler> = new Promise((resolve) => {
      const sampler: Tone.Sampler = new Tone.Sampler({
        urls: this._pathUrl(samplesMap[SAMPLER_MAP[this.sound]], SAMPLER_MAP[this.sound]),
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
      this.value = newInstrument.value;
      this.typeValue = newInstrument.typeValue;
      if (
        this.sound !== newInstrument.sound ||
        this.actions.some((action, index) => compareInstructions(newInstrument.actions?.[index], action)) ||
        newInstrument.actions.some((action, index) => compareInstructions(this.actions?.[index], action))
      ) {
        await this.end();

        this.sound = newInstrument.sound;
        this.actions = newInstrument.actions;

        await this.start();
      } else {
        await super.start();
      }
    }
  }

  _pathUrl (notes: any, sound: string): any {
    const pathNotes: any = {};

    Object.keys(notes).forEach((note) => {
      pathNotes[note] = `samples/${sound}/${notes[note]}`;
    });

    return pathNotes;
  }
}
