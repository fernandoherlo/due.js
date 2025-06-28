import type { IInstruction } from '~/src/types';

export interface IInterpreter {
  exec: (lexical: IInstruction[]) => IInstruction[];
}
