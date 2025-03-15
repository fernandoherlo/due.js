import * as Tone from 'tone';
import { IReverb, IApp } from '~/src/vite-env';
import Effect from '..';

export default class Reverb extends Effect implements IReverb {
  protected _effect: Tone.Reverb | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this._canUpdate = true;
    this._max = 20;
  }

  create () {
    this._effect = new Tone.Reverb();
    if (!Array.isArray(this.value)) {
      this._effect.decay = this._getValue(this.value.value);
    }

    super.create();
  }

  async update (value: any): Promise<void> {
    if (this._canUpdate && this._effect) {
      this._effect.decay = this._getValue(value);
    }
  }
}
