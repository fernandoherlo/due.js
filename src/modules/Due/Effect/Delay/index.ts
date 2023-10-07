import * as Tone from 'tone';
import { IDelay } from '~/src/vite-env';
import Effect from '..';

export default class Delay extends Effect implements IDelay {
  _effect: Tone.FeedbackDelay | null = null;
  _canUpdate: boolean = true;

  create () {
    this._effect = new Tone.FeedbackDelay();
    if (!Array.isArray(this.value)) {
      const value = this.value.value.split('-');
      const delay = parseFloat(value[0]);
      const feedback = parseFloat(value[1]);

      this._effect.delayTime.value = delay;
      this._effect.feedback.value = feedback || 0.5;
    }

    super.create();
  }
}
