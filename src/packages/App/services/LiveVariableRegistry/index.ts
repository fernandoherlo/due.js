import type { ILiveVariableRegistry, ILiveVariableRange, LiveVariableSubscriber } from '~/src/packages/App/types/ILiveVariableRegistry';

interface ILiveVariableState {
  value: number | undefined;
  range: ILiveVariableRange | undefined;
  sourceActive: boolean;
  subscribers: Set<LiveVariableSubscriber>;
}

export default class LiveVariableRegistry implements ILiveVariableRegistry {
  private readonly variables = new Map<string, ILiveVariableState>();

  configure (key: string, range?: ILiveVariableRange): void {
    const state = this.getState(key);
    state.value = undefined;
    state.range = range;
    state.sourceActive = true;
    this.notify(state, range?.min ?? 0, range !== undefined);
  }

  getValue (key: string): number | undefined {
    return this.variables.get(key)?.value;
  }

  getRange (key: string): ILiveVariableRange | undefined {
    return this.variables.get(key)?.range;
  }

  subscribe (key: string, subscriber: LiveVariableSubscriber): () => void {
    this.getState(key).subscribers.add(subscriber);

    return () => {
      const state = this.variables.get(key);
      if (!state) return;
      state.subscribers.delete(subscriber);
      this.removeIfUnused(key, state);
    };
  }

  publish (key: string, rawValue: number): void {
    const state = this.variables.get(key);
    if (!state?.sourceActive) return;

    const { range } = state;
    const mapped = range !== undefined;
    const value = range
      ? range.min + (rawValue / 127) * (range.max - range.min)
      : rawValue;
    state.value = value;
    this.notify(state, value, mapped);
  }

  reset (key: string): void {
    const state = this.variables.get(key);
    if (!state) return;

    const mapped = state.range !== undefined;
    const initialValue = state.range?.min ?? 0;
    state.value = undefined;
    state.sourceActive = false;
    this.notify(state, initialValue, mapped);
    this.removeIfUnused(key, state);
  }

  private getState (key: string): ILiveVariableState {
    let state = this.variables.get(key);
    if (!state) {
      state = { value: undefined, range: undefined, sourceActive: false, subscribers: new Set() };
      this.variables.set(key, state);
    }
    return state;
  }

  private notify (state: ILiveVariableState, value: number, mapped: boolean): void {
    for (const subscriber of [...state.subscribers]) subscriber(value, mapped);
  }

  private removeIfUnused (key: string, state: ILiveVariableState): void {
    if (!state.sourceActive && state.subscribers.size === 0) this.variables.delete(key);
  }
}
