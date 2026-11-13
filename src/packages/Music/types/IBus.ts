import type { IInstruction } from '~/src/types';

export interface IBus extends IInstruction {
  start: () => Promise<void>;
  update: (instruction: IInstruction) => Promise<void>;
  end: () => Promise<void>;
  output: import('tone').Gain;
}
