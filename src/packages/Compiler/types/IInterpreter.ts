import type { IInstruction } from '~/src/types';

export interface IInterpreter {
  exec: (lexical: IInstruction[]) => Record<string, IInstruction>;
}
