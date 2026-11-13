import type { IEffect, IApp } from '~/src/types';
import Instrument from '../Instrument';
import { COMMANDS } from '~/src/packages/Compiler/constants';

export default class Effect extends Instrument implements IEffect {
  protected effect: any | null = null;
  protected min: number = 0;
  protected max: number = 0;
  private readonly liveVariableUnsubscribers: Map<string, () => void> = new Map();

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
      this.effect.connect(action.effect ?? action);
    }
  }

  get output () {
    return this.effect;
  }

  async end (): Promise<void> {
    this.clearLiveVariableSubscriptions();
    if (this.effect) {
      await this.effect.disconnect();
      await this.effect.dispose();
    }
  }

  protected getValue (value: any, onLiveValue?: (value: number) => void): number {
    if (value && typeof value === 'string' && value.startsWith(COMMANDS.$$)) {
      this.clearLiveVariableSubscriptions(value);
      const range = this.app.$liveVariableRegistry.getRange(value);
      const mapLiveValue = (liveValue: number, mapped: boolean) => mapped ? liveValue : this.mapValue(liveValue);
      if (!this.liveVariableUnsubscribers.has(value) && onLiveValue) {
        const unsubscribe = this.app.$liveVariableRegistry.subscribe(value, (liveValue, mapped) => {
          onLiveValue(mapLiveValue(liveValue, mapped));
        });
        this.liveVariableUnsubscribers.set(value, unsubscribe);
      }
      const currentValue = this.app.$liveVariableRegistry.getValue(value) ?? range?.min ?? 0;
      return mapLiveValue(currentValue, range !== undefined);
    }

    this.clearLiveVariableSubscriptions();
    return this.mapValue(value);
  }

  private clearLiveVariableSubscriptions (except?: string): void {
    for (const [key, unsubscribe] of this.liveVariableUnsubscribers) {
      if (key === except) continue;
      unsubscribe();
      this.liveVariableUnsubscribers.delete(key);
    }
  }

  protected mapValue (value: number): number {
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
