import * as Tone from 'tone';
import { IDelay } from '~/src/vite-env';
import Effect from '..';

export default class Delay extends Effect implements IDelay {
  _effect: Tone.FeedbackDelay | null = null;
  _canUpdate: boolean = true;

  create () {
    this._effect = new Tone.FeedbackDelay();
    if (!Array.isArray(this.value)) {
      const delay = this._getValue(this.value.value);
      const feedback = parseFloat(this.value.duration);

      this._effect.delayTime.value = delay;
      this._effect.feedback.value = feedback || 0.5;
    }

    super.create();
  }

  async update (value: any): Promise<void> {
    if (this._canUpdate && this._effect) {
      const delay = this._getValue(value);
      this._effect.delayTime.value = delay;
    }
  }
}
