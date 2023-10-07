import * as Tone from 'tone';
import { IChorus } from '~/src/vite-env';
import Effect from '..';

export default class Reverb extends Effect implements IChorus {
  _effect: Tone.Chorus | null = null;
  _canUpdate: boolean = true;

  create () {
    this._effect = new Tone.Chorus();
    if (!Array.isArray(this.value)) {
      this._effect.frequency.value = parseFloat(this.value.value);
    }

    super.create();
  }
}
