import type { IVolumen, IApp } from '~/src/types';
import * as Tone from 'tone';
import Effect from '..';

export default class Volumen extends Effect implements IVolumen {
  protected _effect: Tone.Volume | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this.canUpdate = true;
    this.min = -30;
    this.max = 30;
  }

  create () {
    this._effect = new Tone.Volume();
    if (!Array.isArray(this.value)) {
      this._effect.volume.value = this.getValue(this.value.value);
    }

    super.create();
  }

  async update (value: any): Promise<void> {
    if (this.canUpdate && this._effect) {
      this._effect.volume.value = this.getValue(value);
    }
  }
}
