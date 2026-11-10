import type { IInstruction } from '~/src/types';

export interface IMusic {
  start: () => Promise<void>;
  toggle: () => Promise<void>;
  validate: (instructions: Array<IInstruction>) => void;
  add: (instructions: Array<IInstruction>) => Promise<void>;
  update: (instructions: Array<IInstruction>) => Promise<void>;
  delete: (instructions: Array<IInstruction>) => Promise<void>;
}
