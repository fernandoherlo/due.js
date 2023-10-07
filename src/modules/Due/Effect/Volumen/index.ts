import * as Tone from 'tone';
import { IVolumen } from '~/src/vite-env';
import Effect from '..';

export default class Volumen extends Effect implements IVolumen {
  _effect: Tone.Volume | null = null;
  _canUpdate: boolean = true;

  create () {
    this._effect = new Tone.Volume();
    if (!Array.isArray(this.value)) {
      this._effect.volume.value = parseFloat(this.value.value);
    }

    super.create();
  }
}
