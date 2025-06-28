import type { IChorus, IApp } from '~/src/types';
import * as Tone from 'tone';
import Effect from '..';

export default class Reverb extends Effect implements IChorus {
  protected effect: Tone.Chorus | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this.canUpdate = true;
    this.max = 30;
  }

  create () {
    this.effect = new Tone.Chorus();
    if (!Array.isArray(this.value)) {
      this.effect.frequency.value = this.getValue(this.value.value);
    }

    super.create();
  }

  async update (value: any): Promise<void> {
    if (this.canUpdate && this.effect) {
      this.effect.frequency.value = this.getValue(value);
    }
  }
}
