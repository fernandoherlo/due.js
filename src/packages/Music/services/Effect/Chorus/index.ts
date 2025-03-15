import * as Tone from 'tone';
import { IChorus, IApp } from '~/src/vite-env';
import Effect from '..';

export default class Reverb extends Effect implements IChorus {
  protected _effect: Tone.Chorus | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this._canUpdate = true;
    this._max = 30;
  }

  create () {
    this._effect = new Tone.Chorus();
    if (!Array.isArray(this.value)) {
      this._effect.frequency.value = this._getValue(this.value.value);
    }

    super.create();
  }

  async update (value: any): Promise<void> {
    if (this._canUpdate && this._effect) {
      this._effect.frequency.value = this._getValue(value);
    }
  }
}
