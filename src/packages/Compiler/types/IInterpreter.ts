import { IInstruction } from '~/src/vite-env';

export interface IInterpreter {
  exec: (lexical: IInstruction[]) => IInstruction[];
}
