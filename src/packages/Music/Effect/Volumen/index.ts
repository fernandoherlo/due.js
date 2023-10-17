import * as Tone from 'tone';
import { IVolumen } from '~/src/vite-env';
import Effect from '..';

export default class Volumen extends Effect implements IVolumen {
  _effect: Tone.Volume | null = null;
  _canUpdate: boolean = true;

  create () {
    this._effect = new Tone.Volume();
    if (!Array.isArray(this.value)) {
      this._effect.volume.value = this._getValue(this.value.value);
    }

    super.create();
  }

  async update (value: any): Promise<void> {
    if (this._canUpdate && this._effect) {
      const volume = this._getValue(value);
      this._effect.volume.value = volume;
    }
  }
}
