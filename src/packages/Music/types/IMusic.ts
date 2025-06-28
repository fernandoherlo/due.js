import type { IInstruction } from '~/src/types';

export interface IMusic {
  start: () => Promise<void>;
  toggle: () => Promise<void>;
  add: (instructions: Array<IInstruction>) => Promise<void>;
  update: (instructions: Array<IInstruction>) => void;
  delete: (instructions: Array<IInstruction>) => Promise<void>;
}
