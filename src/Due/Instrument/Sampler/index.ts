import * as Tone from 'tone';
import { IInstrument, ISampler } from '../../../vite-env';
import samples from '../../../../public/samples/index.json';
import Instrument from '..';
import { SAMPLER_MAP } from '../../constants';

export default class Sampler extends Instrument implements ISampler {
  _instrument: Tone.Sampler | null = null;
  _canUpdate: boolean = true;

  async start (): Promise<void> {
    const samplesMap: any = samples;

    const samplerPromise: Promise<Tone.Sampler> = new Promise((resolve) => {
      const sampler: Tone.Sampler = new Tone.Sampler({
        urls: this._pathUrl(samplesMap[SAMPLER_MAP[this.sound]], SAMPLER_MAP[this.sound]),
        onload: function onload () {
          return resolve(sampler);
        }
      });
    });
    const gain = new Tone.Gain(6).toDestination();
    this._instrument = (await samplerPromise).connect(gain);
    this._instrument.debug = this._app.$debug;

    await super.start();
  }

  async update (newInstrument: IInstrument): Promise<void> {
    if (this._canUpdate) {
      this.value = newInstrument.value;
      if (this.sound !== newInstrument.sound) {
        this.sound = newInstrument.sound;
        await this.end();
        await this.start();
      } else {
        await this.play();
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
