export interface ILiveVariableRange {
  min: number;
  max: number;
}

export type LiveVariableSubscriber = (value: number, mapped: boolean) => void;

export interface ILiveVariableRegistry {
  configure: (key: string, range?: ILiveVariableRange) => void;
  getValue: (key: string) => number | undefined;
  getRange: (key: string) => ILiveVariableRange | undefined;
  subscribe: (key: string, subscriber: LiveVariableSubscriber) => () => void;
  publish: (key: string, value: number) => void;
  reset: (key: string) => void;
}
