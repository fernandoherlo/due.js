import type { IInstruction } from '~/src/types';

export interface ICompiler {
  exec: (code: string) => Record<string, IInstruction[]>;
}
