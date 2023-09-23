import * as Tone from 'tone';
import { ISampler } from '../../../vite-env';
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
        urls: this._pathUrl(samplesMap[SAMPLER_MAP[this.sound]]),
        baseUrl: '/',
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

  _pathUrl (urls: any): any {
    for (const sound of urls) {
      for (const note of sound) {
        sound[note] = `samples/${sound[note]}`;
      }
    }
  }
}
