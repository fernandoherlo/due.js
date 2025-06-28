import type { IDelay, IApp } from '~/src/types';
import * as Tone from 'tone';
import Effect from '..';

export default class Delay extends Effect implements IDelay {
  protected effect: Tone.FeedbackDelay | null = null;

  constructor (data: any, app: IApp) {
    super(data, app);

    this.canUpdate = true;
    this.max = 3;
  }

  create () {
    this.effect = new Tone.FeedbackDelay();
    if (!Array.isArray(this.value)) {
      const delay: number = this.getValue(this.value.value);
      const feedback: number = parseFloat(this.value.duration);

      this.effect.delayTime.value = delay;
      this.effect.feedback.value = feedback || 0.5;
    }

    super.create();
  }

  async update (value: any): Promise<void> {
    if (this.canUpdate && this.effect) {
      this.effect.delayTime.value = this.getValue(value);
    }
  }
}
