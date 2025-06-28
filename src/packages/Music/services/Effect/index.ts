import type { IEffect, IApp } from '~/src/types';
import Instrument from '../Instrument';
import { COMMANDS } from '~/src/packages/Compiler/constants';

export default class Effect extends Instrument implements IEffect {
  protected effect: any | null = null;
  protected min: number = 0;
  protected max: number = 0;

  constructor (data: any, app: IApp) {
    super(data, app);

    this.canUpdate = true;
  }

  create () {
    if (this.effect) {
      this.effect.debug = this.app.__debugEnabled;
    }
  }

  toDestination () {
    if (this.effect) {
      this.effect.toDestination();
    }
  }

  connect (action: any) {
    if (this.effect) {
      this.effect.connect(action.effect);
    }
  }

  async end (): Promise<void> {
    if (this.effect) {
      await this.effect.disconnect();
      await this.effect.dispose();
    }
  }

  protected getValue (value: any): number {
    if (value && typeof value === 'string' && value.startsWith(COMMANDS.$$)) {
      this.app.$variablesLiveMap[value] = this;
      return 0; // default, set on live midi in
    }

    return this.mapValue(value);
  }

  private mapValue (value: number): number {
    const { min: fromMin, max: fromMax }: { min: number, max: number } = { min: 0, max: 127 };
    const { min: toMin, max: toMax }: { min: number, max: number } = { min: this.min, max: this.max };

    // Determine how wide the ranges are
    const fromSize: number = fromMax - fromMin;
    const toSize: number = toMax - toMin;
    // Get the percentage of the original range `value` represents, ignoring the minimum value
    const fromPercent: number = (value - fromMin) / fromSize;
    // Get the corresponding percentage of the new range, plus its minimum value
    const result: number = (fromPercent * toSize) + toMin;

    return result;
  }
}
