import type { IVolumen, IApp } from '~/src/types';
import * as Tone from 'tone';
import Effect from '..';

export default class Volumen extends Effect implements IVolumen {
  protected effect: Tone.Volume | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this.canUpdate = true;
    this.min = -30;
    this.max = 30;
  }

  create () {
    this.effect = new Tone.Volume();
    if (!Array.isArray(this.value)) {
      this.effect.volume.value = this.getValue(this.value.value);
    }

    super.create();
  }

  async update (value: any): Promise<void> {
    if (this.canUpdate && this.effect) {
      this.effect.volume.value = this.getValue(value);
    }
  }
}
