import type { IInstruction } from '~/src/types';

export interface ILexer {
  exec: (code: string) => IInstruction[];
}
