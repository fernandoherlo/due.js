import * as Tone from 'tone';
import { IReverb } from '~/src/vite-env';
import Effect from '..';

export default class Reverb extends Effect implements IReverb {
  _effect: Tone.Reverb | null = null;
  _canUpdate: boolean = true;
  _min: number = 0;
  _max: number = 20;

  create () {
    this._effect = new Tone.Reverb();
    if (!Array.isArray(this.value)) {
      this._effect.decay = this._getValue(this.value.value);
    }

    super.create();
  }

  async update (value: any): Promise<void> {
    if (this._canUpdate && this._effect) {
      const decay = this._getValue(value);
      this._effect.decay = decay;
    }
  }
}
