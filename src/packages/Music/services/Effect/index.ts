import { IEffect, IApp } from '~/src/vite-env';
import Instrument from '../Instrument';
import { COMMANDS } from '~/src/packages/Compiler/constants';

export default class Effect extends Instrument implements IEffect {
  protected _effect: any | null = null;
  protected _min: number = 0;
  protected _max: number = 0;

  constructor (data: any, app: IApp) {
    super(data, app);

    this._canUpdate = true;
  }

  create () {
    if (this._effect) {
      this._effect.debug = this._app.$debugEnabled;
    }
  }

  toDestination () {
    if (this._effect) {
      this._effect.toDestination();
    }
  }

  connect (action: any) {
    if (this._effect) {
      this._effect.connect(action._effect);
    }
  }

  async end (): Promise<void> {
    if (this._effect) {
      await this._effect.disconnect();
      await this._effect.dispose();
    }
  }

  protected _getValue (value: any): number {
    if (value && typeof value === 'string' && value.startsWith(COMMANDS.$$)) {
      this._app.$variablesLiveMap[value] = this;
      return 0; // default, set on live midi in
    }

    return this._mapValue(value);
  }

  private _mapValue (value: number): number {
    const { min: fromMin, max: fromMax }: { min: number, max: number } = { min: 0, max: 127 };
    const { min: toMin, max: toMax }: { min: number, max: number } = { min: this._min, max: this._max };

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
