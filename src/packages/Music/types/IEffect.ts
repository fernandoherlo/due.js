import type { IApp, IInstrument, IInstruction } from '~/src/types';

export interface IEffect extends IInstrument {
  create: () => void;
  toDestination: () => void;
  connect: (action: IEffect | { effect: import('tone').Gain }) => void;
  end: () => Promise<void>
}

export type EffectsMap = Record<string, (instruction: IInstruction, app: IApp) => IEffect>;
