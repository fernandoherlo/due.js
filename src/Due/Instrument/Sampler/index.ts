import * as Tone from 'tone';
import { ISampler } from '../../../vite-env';
import samples from '../../samples.json';
import Instrument from '..';

export default class Sampler extends Instrument implements ISampler {
  _instrument: Tone.Sampler | null = null;
  _canUpdate: boolean = true;

  async start (): Promise<void> {
    const samplesMap = samples[this.sound];
    const samplerPromise: Promise<Tone.Sampler> = new Promise((resolve) => {
       const sampler: Tone.Sampler = new Tone.Sampler({
        urls: samplesMap,
        baseUrl: '/',
        onload: function onload() {
          return resolve(sampler);
        }
      });
    });
    const gain = new Tone.Gain(6).toDestination();
    this._instrument = (await samplerPromise).connect(gain);
    this._instrument.debug = this._app.$debug;

    await super.start();
  }
}
