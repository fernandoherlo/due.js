import type { EffectsMap, IInstruction } from '~/src/types';

export interface IInstrument extends IInstruction {
  start: () => Promise<void>;
  startActions: (effects: EffectsMap) => Promise<void>;
  end: () => Promise<void>;
  play: () => Promise<void>;
  setMuted: (muted: boolean) => void;
  update: (newIntrument: IInstrument) => Promise<void>;
}
