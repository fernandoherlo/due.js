import { IInstruction } from '~/src/vite-env';

export interface ILexer {
  exec: (code: string) => IInstruction[];
}
