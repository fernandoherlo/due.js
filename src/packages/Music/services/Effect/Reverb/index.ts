import type { IReverb, IApp } from '~/src/types';
import * as Tone from 'tone';
import Effect from '..';

export default class Reverb extends Effect implements IReverb {
  protected _effect: Tone.Reverb | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this.canUpdate = true;
    this.max = 20;
  }

  create () {
    this._effect = new Tone.Reverb();
    if (!Array.isArray(this.value)) {
      this._effect.decay = this.getValue(this.value.value);
    }

    super.create();
  }

  async update (value: any): Promise<void> {
    if (this.canUpdate && this._effect) {
      this._effect.decay = this.getValue(value);
    }
  }
}
