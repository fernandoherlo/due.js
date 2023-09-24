import * as Tone from 'tone';
import { IReverb } from '../../../vite-env';
import Effect from '..';

export default class Reverb extends Effect implements IReverb {
  _effect: Tone.Reverb | null = null;
  _canUpdate: boolean = true;

  create () {
    this._effect = new Tone.Reverb();
    if (!Array.isArray(this.value)) {
      this._effect.decay = parseFloat(this.value.value);
    }

    super.create();
  }
}
